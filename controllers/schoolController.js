const { supabase } = require('../config/supabase');

// Fetch all schools
const getSchools = async (req, res) => {
    try {
        const { data: schoolsData, error: schoolsError } = await supabase
            .from('schools')
            .select(`
                sid,
                sname,
                sstreetaddress,
                sdistrictid,
                scityid,
                slanguageid,
                sgss,
                stitle1,
                schooldistricts (
                    districtname
                ),
                cities (
                    cityname
                ),
                languages (
                    languagename
                )
            `)
            .order('sname', { ascending: true });

        if (schoolsError) throw schoolsError;

        // Format the schoolsData to include names instead of IDs
        const formattedSchoolsData = schoolsData.map(school => ({
            ...school,
            districtName: school.schooldistricts ? school.schooldistricts.districtname : null,
            cityName: school.cities ? school.cities.cityname : null,
            languageName: school.languages ? school.languages.languagename : null
        }));

        res.render('pages/admin-dashboard/schools/view', {
            schools: formattedSchoolsData || [],
            error: null
        });
    } catch (error) {
        console.error('Error fetching schools data:', error);
        res.render('pages/admin-dashboard/schools/view', {
            schools: [],
            error: 'Error retrieving schools data'
        });
    }
};

// Render add school form
const addSchoolForm = async (req, res) => {
    try {
        // Fetch all required data for dropdowns
        const { data: districts, error: districtsError } = await supabase
            .from('schooldistricts')
            .select('districtid, districtname')
            .order('districtname');

        const { data: cities, error: citiesError } = await supabase
            .from('cities')
            .select('cityid, cityname')
            .order('cityname');

        const { data: languages, error: languagesError } = await supabase
            .from('languages')
            .select('languageid, languagename')
            .order('languagename');

        if (districtsError) throw districtsError;
        if (citiesError) throw citiesError;
        if (languagesError) throw languagesError;

        res.render('pages/admin-dashboard/schools/add', {
            districts,
            cities,
            languages,
            error: null
        });
    } catch (error) {
        console.error('Error fetching data for add school form:', error);
        res.render('pages/admin-dashboard/schools/add', {
            districts: [],
            cities: [],
            languages: [],
            error: 'Error loading form data'
        });
    }
};

// Add a new school
const addSchool = async (req, res) => {
    try {
        const { sname, sstreetaddress, sdistrictid, scityid, slanguageid, sgss, stitle1 } = req.body;

        // Input validation
        if (!sname || typeof sname !== 'string') {
            return res.status(400).json({
                error: 'School name is required and must be a string'
            });
        }

        const trimmedName = sname.trim();
        if (trimmedName.length < 2) {
            return res.status(400).json({
                error: 'School name must be at least 2 characters'
            });
        }

        // Check for existing school with same name
        const { data: existingSchool, error: checkError } = await supabase
            .from('schools')
            .select('sid')
            .ilike('sname', trimmedName)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
        }

        if (existingSchool) {
            return res.status(409).json({
                error: 'A school with this name already exists'
            });
        }

        const { data, error } = await supabase
            .from('schools')
            .insert([{
                sname: trimmedName,
                sstreetaddress,
                sdistrictid,
                scityid,
                slanguageid,
                sgss: sgss === 'true',
                stitle1: stitle1 === 'true'
            }])
            .select();

        if (error) throw error;

        res.status(201).json({
            message: 'School added successfully',
            data: data[0]
        });
    } catch (error) {
        console.error('Error adding new school:', error);
        res.status(500).json({
            error: 'Failed to add school'
        });
    }
};

// Edit school form
const editSchoolForm = async (req, res) => {
    try {
        const { schoolId } = req.params;

        if (!schoolId || isNaN(schoolId)) {
            return res.status(400).render('pages/admin-dashboard/schools/edit', {
                error: 'Invalid school ID',
                school: null,
                districts: [],
                cities: [],
                languages: []
            });
        }

        // Fetch school data and all required dropdown data
        const [
            { data: schoolData, error: schoolError },
            { data: districts, error: districtsError },
            { data: cities, error: citiesError },
            { data: languages, error: languagesError }
        ] = await Promise.all([
            supabase.from('schools').select('*').eq('sid', schoolId).single(),
            supabase.from('schooldistricts').select('districtid, districtname').order('districtname'),
            supabase.from('cities').select('cityid, cityname').order('cityname'),
            supabase.from('languages').select('languageid, languagename').order('languagename')
        ]);

        if (schoolError) throw schoolError;
        if (districtsError) throw districtsError;
        if (citiesError) throw citiesError;
        if (languagesError) throw languagesError;

        if (!schoolData) {
            return res.render('pages/admin-dashboard/schools/edit', {
                error: 'School not found',
                school: null,
                districts: [],
                cities: [],
                languages: []
            });
        }

        res.render('pages/admin-dashboard/schools/edit', {
            school: schoolData,
            districts,
            cities,
            languages,
            error: null
        });
    } catch (error) {
        console.error('Error fetching school data for edit:', error);
        res.render('pages/admin-dashboard/schools/edit', {
            error: 'Error retrieving school data',
            school: null,
            districts: [],
            cities: [],
            languages: []
        });
    }
};

// Update school
const updateSchool = async (req, res) => {
    try {
        const { schoolId } = req.params;
        const { sname, sstreetaddress, sdistrictid, scityid, slanguageid, sgss, stitle1 } = req.body;

        // Input validation
        if (!sname || typeof sname !== 'string') {
            return res.status(400).json({
                error: 'School name is required and must be a string'
            });
        }

        const trimmedName = sname.trim();
        if (trimmedName.length < 2) {
            return res.status(400).json({
                error: 'School name must be at least 2 characters'
            });
        }

        // Check for existing school with same name (excluding current record)
        const { data: existingSchool, error: checkError } = await supabase
            .from('schools')
            .select('sid')
            .ilike('sname', trimmedName)
            .neq('sid', schoolId)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
        }

        if (existingSchool) {
            return res.status(409).json({
                error: 'A school with this name already exists'
            });
        }

        const { data, error } = await supabase
            .from('schools')
            .update({
                sname: trimmedName,
                sstreetaddress,
                sdistrictid,
                scityid,
                slanguageid,
                sgss: sgss === 'true',
                stitle1: stitle1 === 'true'
            })
            .eq('sid', schoolId)
            .select();

        if (error) throw error;

        res.json({
            message: 'School updated successfully',
            data: data[0]
        });
    } catch (error) {
        console.error('Error updating school:', error);
        res.status(500).json({
            error: 'Failed to update school'
        });
    }
};

// Delete school
const deleteSchool = async (req, res) => {
    try {
        const { schoolId } = req.params;

        if (!schoolId || isNaN(schoolId)) {
            return res.status(400).json({
                error: 'Invalid school ID'
            });
        }

        // Check if school exists before deletion
        const { data: existingSchool, error: checkError } = await supabase
            .from('schools')
            .select('sid')
            .eq('sid', schoolId)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
        }

        if (!existingSchool) {
            return res.status(404).json({
                error: 'School not found'
            });
        }

        const { error } = await supabase
            .from('schools')
            .delete()
            .eq('sid', schoolId);

        if (error) throw error;

        res.json({
            message: 'School deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting school:', error);
        res.status(500).json({
            error: 'Failed to delete school'
        });
    }
};

module.exports = {
    getSchools,
    addSchoolForm,
    addSchool,
    editSchoolForm,
    updateSchool,
    deleteSchool
};