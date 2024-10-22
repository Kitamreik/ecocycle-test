const { supabase } = require('../config/supabase');


// Fetch all funding sources
const getFundings = async (req, res) => {
    try {
        const { data: fundingsData, error: fundingsError } = await supabase
            .from('funding')
            .select('*')
            .order('fname', { ascending: true });

        if (fundingsError) throw fundingsError;

        res.render('pages/admin-dashboard/fundings/view', {
            fundings: fundingsData || [],
            error: null
        });
    } catch (error) {
        console.error('Error fetching funding data:', error);
        res.render('pages/admin-dashboard/fundings/view', {
            fundings: [],
            error: 'Error retrieving funding data'
        });
    }
};

// Render add funding form
const addFundingForm = (req, res) => {
    res.render('pages/admin-dashboard/fundings/add');
};

// Add a new funding source
const addFunding = async (req, res) => {
    try {
        const { fName } = req.body;

        // Input validation
        if (!fName || typeof fName !== 'string') {
            return res.status(400).json({
                error: 'Funding name is required and must be a string'
            });
        }

        const trimmedName = fName.trim();
        if (trimmedName.length < 2 || trimmedName.length > 35) {
            return res.status(400).json({
                error: 'Funding name must be between 2 and 35 characters'
            });
        }

        // Check for existing funding with same name
        const { data: existingFunding, error: checkError } = await supabase
            .from('funding')
            .select('fid')
            .ilike('fname', trimmedName)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
        }

        if (existingFunding) {
            return res.status(409).json({
                error: 'A funding source with this name already exists'
            });
        }

        // Insert new funding
        const { data, error } = await supabase
            .from('funding')
            .insert([{ fname: trimmedName }])
            .select();

        if (error) throw error;

        res.status(201).json({
            message: 'Funding added successfully',
            data: data[0]
        });
    } catch (error) {
        console.error('Error adding new funding:', error);
        res.status(500).json({
            error: 'Failed to add funding source'
        });
    }
};

// Edit funding form
const editFundingForm = async (req, res) => {
    try {
        const { fundingId } = req.params;

        if (!fundingId || isNaN(fundingId)) {
            return res.status(400).render('pages/admin-dashboard/fundings/edit', {
                error: 'Invalid funding ID',
                funding: null
            });
        }

        const { data: fundingData, error: fundingError } = await supabase
            .from('funding')
            .select('*')
            .eq('fid', fundingId)
            .single();

        if (fundingError) throw fundingError;

        if (!fundingData) {
            return res.render('pages/admin-dashboard/fundings/edit', {
                error: 'Funding source not found',
                funding: null
            });
        }

        res.render('pages/admin-dashboard/fundings/edit', {
            funding: fundingData,
            error: null
        });
    } catch (error) {
        console.error('Error fetching funding data for edit:', error);
        res.render('pages/admin-dashboard/fundings/edit', {
            error: 'Error retrieving funding data',
            funding: null
        });
    }
};

// Update funding source
const updateFunding = async (req, res) => {
    try {
        const { fundingId } = req.params;
        const { fName } = req.body;

        // Input validation
        if (!fName || typeof fName !== 'string') {
            return res.status(400).json({
                error: 'Funding name is required and must be a string'
            });
        }

        const trimmedName = fName.trim();
        if (trimmedName.length < 2 || trimmedName.length > 35) {
            return res.status(400).json({
                error: 'Funding name must be between 2 and 35 characters'
            });
        }

        // Check for existing funding with same name (excluding current record)
        const { data: existingFunding, error: checkError } = await supabase
            .from('funding')
            .select('fid')
            .ilike('fname', trimmedName)
            .neq('fid', fundingId)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
        }

        if (existingFunding) {
            return res.status(409).json({
                error: 'A funding source with this name already exists'
            });
        }

        const { data, error } = await supabase
            .from('funding')
            .update({ fname: trimmedName })
            .eq('fid', fundingId)
            .select();

        if (error) throw error;

        res.json({
            message: 'Funding updated successfully',
            data: data[0]
        });
    } catch (error) {
        console.error('Error updating funding:', error);
        res.status(500).json({
            error: 'Failed to update funding source'
        });
    }
};

// Delete funding source
const deleteFunding = async (req, res) => {
    try {
        const { fundingId } = req.params;
        console.log('Delete request for funding ID:', fundingId);

        if (!fundingId || isNaN(fundingId)) {
            return res.status(400).json({
                error: 'Invalid funding ID'
            });
        }

        // Check if funding exists before deletion
        const { data: existingFunding, error: checkError } = await supabase
            .from('funding')
            .select('fid')
            .eq('fid', fundingId)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            console.error('Error checking funding:', checkError);
            throw checkError;
        }

        if (!existingFunding) {
            return res.status(404).json({
                error: 'Funding source not found'
            });
        }

        const { error } = await supabase
            .from('funding')
            .delete()
            .eq('fid', fundingId);

        if (error) {
            console.error('Error during deletion:', error);
            throw error;
        }

        // Always return a properly formatted JSON response
        return res.status(200).json({
            message: 'Funding deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting funding:', error);
        return res.status(500).json({
            error: 'Failed to delete funding source'
        });
    }
};

module.exports = {
    addFundingForm,
    getFundings,
    addFunding,
    editFundingForm,
    updateFunding,
    deleteFunding
};