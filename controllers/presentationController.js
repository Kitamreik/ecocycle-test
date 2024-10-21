const { supabase } = require('../config/supabase');

// Fetch all presentations
const getPresentations = async (req, res) => {
    try {
        const { data: presentationsData, error: presentationsError } = await supabase
            .from('presentations')
            .select(`
                pid,
                pname,
                created_at,
                updated_at,
                presentationcategories (
                    categoryname
                )
            `);

        if (presentationsError) throw presentationsError;
        res.render('pages/admin-dashboard/presentations/view', { presentations: presentationsData || [] });
    } catch (error) {
        console.error('Error fetching presentations data:', error);
        res.status(500).json({ error: 'Error retrieving data from Supabase' });
    }
};

// Add a new presentation
const addPresentation = async (req, res) => {
    try {
        const { pname, pcategoryid } = req.body;

        const { data, error } = await supabase
            .from('presentations')
            .insert([{ pname, pcategoryid }])
            .select();

        if (error) throw error;

        res.status(201).json({ message: 'Presentation added successfully', data });
    } catch (error) {
        console.error('Error adding new presentation:', error);
        res.status(500).json({ error: 'Error adding new presentation to Supabase' });
    }
};

// Edit presentation
const editPresentationForm = async (req, res) => {
    try {
        const { data: presentationData, error: presentationError } = await supabase
            .from('presentations')
            .select('*')
            .eq('pid', req.params.presentationId)
            .single();

        if (presentationError) throw presentationError;

        if (!presentationData) {
            return res.status(404).json({ error: 'Presentation not found' });
        }

        const { data: categories, error: categoriesError } = await supabase.from('presentationcategories').select('categoryid, categoryname');

        if (categoriesError) throw categoriesError;

        res.json({ presentation: presentationData, categories });
    } catch (error) {
        console.error('Error fetching presentation data for edit:', error);
        res.status(500).json({ error: 'Error retrieving presentation data from Supabase' });
    }
};

// Update presentation
const updatePresentation = async (req, res) => {
    try {
        const { pname, pcategoryid } = req.body;

        const { data, error } = await supabase
            .from('presentations')
            .update({ pname, pcategoryid, updated_at: new Date() })
            .eq('pid', req.params.presentationId)
            .select();

        if (error) throw error;

        res.json({ message: 'Presentation updated successfully', data });
    } catch (error) {
        console.error('Error updating presentation:', error);
        res.status(500).json({ error: 'Error updating presentation in Supabase' });
    }
};

// Delete presentation
const deletePresentation = async (req, res) => {
    try {
        const { error } = await supabase
            .from('presentations')
            .delete()
            .eq('pid', req.params.presentationId);

        if (error) throw error;

        res.json({ message: 'Presentation deleted successfully' });
    } catch (error) {
        console.error('Error deleting presentation:', error);
        res.status(500).json({ error: 'Error deleting presentation from Supabase' });
    }
};

module.exports = {
    getPresentations,
    addPresentation,
    editPresentationForm,
    updatePresentation,
    deletePresentation
};
