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
            `);

        if (schoolsError) throw schoolsError;

        // Format the schoolsData to include names instead of IDs
        const formattedSchoolsData = schoolsData.map(school => ({
            ...school,
            // Add the district name if available
            districtName: school.schooldistricts ? school.schooldistricts.districtname : null,
            // Add the city name if available
            cityName: school.cities ? school.cities.cityname : null,
            // Add the language name if available
            languageName: school.languages ? school.languages.languagename : null
        }));
        console.log('Schools data:', formattedSchoolsData);
        res.render('pages/admin-dashboard/schools/view', { schools: formattedSchoolsData || [] });
    } catch (error) {
        console.error('Error fetching schools data:', error);
        res.status(500).json({ error: 'Error retrieving data from Supabase' });
    }
};


// Add a new school
const addSchoolForm = async (req, res) => {
    try {
        const { data: districts, error: districtsError } = await supabase.from('schooldistricts').select('districtid, districtname');
        const { data: cities, error: citiesError } = await supabase.from('cities').select('cityid, cityname');
        const { data: languages, error: languagesError } = await supabase.from('languages').select('languageid, languagename');

        if (districtsError) throw districtsError;
        if (citiesError) throw citiesError;
        if (languagesError) throw languagesError;

        res.json({ districts, cities, languages });
    } catch (error) {
        console.error('Error fetching data for add school form:', error);
        res.status(500).json({ error: 'Error retrieving data from Supabase' });
    }
};

const addSchool = async (req, res) => {
    try {
        const { sname, sstreetaddress, sdistrictid, scityid, slanguageid, sGSS, sTitle1 } = req.body;

        const { data, error } = await supabase
            .from('schools')
            .insert([{ sname, sstreetaddress, sdistrictid, scityid, slanguageid, sGSS, sTitle1 }])
            .select();

        if (error) throw error;

        res.status(201).json({ message: 'School added successfully', data });
    } catch (error) {
        console.error('Error adding new school:', error);
        res.status(500).json({ error: 'Error adding new school to Supabase' });
    }
};

// Edit school
const editSchoolForm = async (req, res) => {
    try {
        const { data: schoolData, error: schoolError } = await supabase
            .from('schools')
            .select('*')
            .eq('sid', req.params.schoolId)
            .single();

        if (schoolError) throw schoolError;

        if (!schoolData) {
            return res.status(404).json({ error: 'School not found' });
        }

        const { data: districts, error: districtsError } = await supabase.from('schooldistricts').select('districtid, districtname');
        const { data: cities, error: citiesError } = await supabase.from('cities').select('cityid, cityname');
        const { data: languages, error: languagesError } = await supabase.from('languages').select('languageid, languagename');

        if (districtsError) throw districtsError;
        if (citiesError) throw citiesError;
        if (languagesError) throw languagesError;

        res.json({ school: schoolData, districts, cities, languages });
    } catch (error) {
        console.error('Error fetching school data for edit:', error);
        res.status(500).json({ error: 'Error retrieving school data from Supabase' });
    }
};

// Update school
const updateSchool = async (req, res) => {
    try {
        const { sname, sstreetaddress, sdistrictid, scityid, slanguageid, sGSS, sTitle1 } = req.body;

        const { data, error } = await supabase
            .from('schools')
            .update({ sname, sstreetaddress, sdistrictid, scityid, slanguageid, sGSS, sTitle1, updated_at: new Date() })
            .eq('sid', req.params.schoolId)
            .select();

        if (error) throw error;

        res.json({ message: 'School updated successfully', data });
    } catch (error) {
        console.error('Error updating school:', error);
        res.status(500).json({ error: 'Error updating school in Supabase' });
    }
};

// Delete school
const deleteSchool = async (req, res) => {
    try {
        const { error } = await supabase
            .from('schools')
            .delete()
            .eq('sid', req.params.schoolId);

        if (error) throw error;

        res.json({ message: 'School deleted successfully' });
    } catch (error) {
        console.error('Error deleting school:', error);
        res.status(500).json({ error: 'Error deleting school from Supabase' });
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
