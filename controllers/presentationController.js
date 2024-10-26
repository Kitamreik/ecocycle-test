const { supabase } = require('../config/supabase');

// Fetch all presentations
const getPresentations = async (req, res) => {
    try {
        const { data: presentationsData, error: presentationsError } = await supabase
            .from('presentations')
            .select(`
                pid,
                pname,
                pcategoryid,
                created_at,
                updated_at,
                presentationcategories (
                    categoryid,
                    categoryname
                )
            `)
            .order('pname', { ascending: true });

        if (presentationsError) throw presentationsError;

        // Format the presentationsData to include category name instead of ID
        const formattedPresentationsData = presentationsData.map(presentation => ({
            ...presentation,
            categoryName: presentation.presentationcategories ? presentation.presentationcategories.categoryname : null
        }));

        res.render('pages/admin-dashboard/presentations/view', {
            presentations: formattedPresentationsData || [],
            error: null
        });
    } catch (error) {
        console.error('Error fetching presentations data:', error);
        res.render('pages/admin-dashboard/presentations/view', {
            presentations: [],
            error: 'Error retrieving presentations data'
        });
    }
};

// Render add presentation form
const addPresentationForm = async (req, res) => {
    try {
        // Fetch all categories for dropdown
        const { data: categories, error: categoriesError } = await supabase
            .from('presentationcategories')
            .select('categoryid, categoryname')
            .order('categoryname');

        if (categoriesError) throw categoriesError;

        res.render('pages/admin-dashboard/presentations/add', {
            categories,
            error: null
        });
    } catch (error) {
        console.error('Error fetching data for add presentation form:', error);
        res.render('pages/admin-dashboard/presentations/add', {
            categories: [],
            error: 'Error loading form data'
        });
    }
};

// Add a new presentation
const addPresentation = async (req, res) => {
    try {
        const { pname, pcategoryid } = req.body;

        // Input validation
        if (!pname || typeof pname !== 'string') {
            return res.status(400).json({
                error: 'Presentation name is required and must be a string'
            });
        }

        const trimmedName = pname.trim();
        if (trimmedName.length < 2) {
            return res.status(400).json({
                error: 'Presentation name must be at least 2 characters'
            });
        }

        // Check for existing presentation with same name
        const { data: existingPresentation, error: checkError } = await supabase
            .from('presentations')
            .select('pid')
            .ilike('pname', trimmedName)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
        }

        if (existingPresentation) {
            return res.status(409).json({
                error: 'A presentation with this name already exists'
            });
        }

        const { data, error } = await supabase
            .from('presentations')
            .insert([{
                pname: trimmedName,
                pcategoryid
            }])
            .select();

        if (error) throw error;

        res.status(201).json({
            message: 'Presentation added successfully',
            data: data[0]
        });
    } catch (error) {
        console.error('Error adding new presentation:', error);
        res.status(500).json({
            error: 'Failed to add presentation'
        });
    }
};

// Edit presentation form
const editPresentationForm = async (req, res) => {
    try {
        const { presentationId } = req.params;

        if (!presentationId || isNaN(presentationId)) {
            return res.status(400).render('pages/admin-dashboard/presentations/edit', {
                error: 'Invalid presentation ID',
                presentation: null,
                categories: []
            });
        }

        // Fetch presentation data and categories
        const [
            { data: presentationData, error: presentationError },
            { data: categories, error: categoriesError }
        ] = await Promise.all([
            supabase.from('presentations').select('*').eq('pid', presentationId).single(),
            supabase.from('presentationcategories').select('categoryid, categoryname').order('categoryname')
        ]);

        if (presentationError) throw presentationError;
        if (categoriesError) throw categoriesError;

        if (!presentationData) {
            return res.render('pages/admin-dashboard/presentations/edit', {
                error: 'Presentation not found',
                presentation: null,
                categories: []
            });
        }

        res.render('pages/admin-dashboard/presentations/edit', {
            presentation: presentationData,
            categories,
            error: null
        });
    } catch (error) {
        console.error('Error fetching presentation data for edit:', error);
        res.render('pages/admin-dashboard/presentations/edit', {
            error: 'Error retrieving presentation data',
            presentation: null,
            categories: []
        });
    }
};

// Update presentation
const updatePresentation = async (req, res) => {
    try {
        const { presentationId } = req.params;
        const { pname, pcategoryid } = req.body;

        // Input validation
        if (!pname || typeof pname !== 'string') {
            return res.status(400).json({
                error: 'Presentation name is required and must be a string'
            });
        }

        const trimmedName = pname.trim();
        if (trimmedName.length < 2) {
            return res.status(400).json({
                error: 'Presentation name must be at least 2 characters'
            });
        }

        // Check for existing presentation with same name (excluding current record)
        const { data: existingPresentation, error: checkError } = await supabase
            .from('presentations')
            .select('pid')
            .ilike('pname', trimmedName)
            .neq('pid', presentationId)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
        }

        if (existingPresentation) {
            return res.status(409).json({
                error: 'A presentation with this name already exists'
            });
        }

        const { data, error } = await supabase
            .from('presentations')
            .update({
                pname: trimmedName,
                pcategoryid,
                updated_at: new Date()
            })
            .eq('pid', presentationId)
            .select();

        if (error) throw error;

        res.json({
            message: 'Presentation updated successfully',
            data: data[0]
        });
    } catch (error) {
        console.error('Error updating presentation:', error);
        res.status(500).json({
            error: 'Failed to update presentation'
        });
    }
};

// Delete presentation
const deletePresentation = async (req, res) => {
    try {
        const { presentationId } = req.params;

        if (!presentationId || isNaN(presentationId)) {
            return res.status(400).json({
                error: 'Invalid presentation ID'
            });
        }

        // Check if presentation exists before deletion
        const { data: existingPresentation, error: checkError } = await supabase
            .from('presentations')
            .select('pid')
            .eq('pid', presentationId)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
        }

        if (!existingPresentation) {
            return res.status(404).json({
                error: 'Presentation not found'
            });
        }

        const { error } = await supabase
            .from('presentations')
            .delete()
            .eq('pid', presentationId);

        if (error) throw error;

        res.json({
            message: 'Presentation deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting presentation:', error);
        res.status(500).json({
            error: 'Failed to delete presentation'
        });
    }
};

module.exports = {
    getPresentations,
    addPresentationForm,
    addPresentation,
    editPresentationForm,
    updatePresentation,
    deletePresentation
};