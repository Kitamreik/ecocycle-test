const { supabase } = require('../config/supabase');

// Fetch all funding sources
const getFundings = async (req, res) => {
    try {
        const { data: fundingsData, error: fundingsError } = await supabase
            .from('funding')
            .select('*');

        if (fundingsError) throw fundingsError;
        console.log('Funding data:', fundingsData);
        res.render('pages/admin-dashboard/funding/view', { fundings: fundingsData || [] });
    } catch (error) {
        console.error('Error fetching funding data:', error);
        res.status(500).json({ error: 'Error retrieving data from Supabase' });
    }
};

// Add a new funding source
const addFunding = async (req, res) => {
    try {
        const { fName } = req.body;

        const { data, error } = await supabase
            .from('funding')
            .insert([{ fName }])
            .select();

        if (error) throw error;

        res.status(201).json({ message: 'Funding added successfully', data });
    } catch (error) {
        console.error('Error adding new funding:', error);
        res.status(500).json({ error: 'Error adding new funding to Supabase' });
    }
};

// Edit funding form
const editFundingForm = async (req, res) => {
    try {
        const { data: fundingData, error: fundingError } = await supabase
            .from('funding')
            .select('*')
            .eq('fid', req.params.fundingId)
            .single();

        if (fundingError) throw fundingError;

        if (!fundingData) {
            return res.status(404).json({ error: 'Funding not found' });
        }

        res.json({ funding: fundingData });
    } catch (error) {
        console.error('Error fetching funding data for edit:', error);
        res.status(500).json({ error: 'Error retrieving funding data from Supabase' });
    }
};

// Update funding source
const updateFunding = async (req, res) => {
    try {
        const { fName } = req.body;

        const { data, error } = await supabase
            .from('funding')
            .update({ fName, updated_at: new Date() })
            .eq('fid', req.params.fundingId)
            .select();

        if (error) throw error;

        res.json({ message: 'Funding updated successfully', data });
    } catch (error) {
        console.error('Error updating funding:', error);
        res.status(500).json({ error: 'Error updating funding in Supabase' });
    }
};

// Delete funding source
const deleteFunding = async (req, res) => {
    try {
        const { error } = await supabase
            .from('funding')
            .delete()
            .eq('fid', req.params.fundingId);

        if (error) throw error;

        res.json({ message: 'Funding deleted successfully' });
    } catch (error) {
        console.error('Error deleting funding:', error);
        res.status(500).json({ error: 'Error deleting funding from Supabase' });
    }
};

module.exports = {
    getFundings,
    addFunding,
    editFundingForm,
    updateFunding,
    deleteFunding
};
