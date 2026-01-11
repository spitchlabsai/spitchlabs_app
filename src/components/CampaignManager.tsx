// "use client"
// import { useState, useEffect } from 'react';
// import { Trash2, Edit2, Plus, Eye, Save, X } from 'lucide-react';
// import { createClient } from '@supabase/supabase-js';
// import { useUser } from "../app/userProvider";

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// // Initialize Supabase client
// const supabase = createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );

// export default function CampaignManager() {
//     const user = useUser();
//     const userId = user?.id;
//     const [campaigns, setCampaigns] = useState([]);
//     const [selectedCampaign, setSelectedCampaign] = useState(null);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [showCreateForm, setShowCreateForm] = useState(false);
//     const [editingCampaign, setEditingCampaign] = useState(null);

//     // Form states
//     const [formData, setFormData] = useState({
//         name: '',
//         purpose: '',
//         script_text: ''
//     });



//     // Fetch campaigns when userId is set
//     useEffect(() => {
//         if (userId) {
//             fetchCampaigns();
//         }
//     }, [userId]);

//     // Fetch all campaigns
//     const fetchCampaigns = async () => {
//         if (!userId) return;

//         setIsLoading(true);
//         setError(null);

//         try {
//             const response = await fetch(`${API_BASE_URL}/campaigns/${userId}`);
//             if (!response.ok) throw new Error('Failed to fetch campaigns');
//             const data = await response.json();
//             setCampaigns(data);
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Fetch single campaign
//     const fetchCampaign = async (campaignId) => {
//         setIsLoading(true);
//         setError(null);

//         try {
//             const response = await fetch(`${API_BASE_URL}/campaigns/${userId}/${campaignId}`);
//             if (!response.ok) throw new Error('Campaign not found');
//             const data = await response.json();
//             setSelectedCampaign(data);
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Create campaign
//     const createCampaign = async () => {
//         if (!formData.name.trim()) {
//             setError('Campaign name is required');
//             return;
//         }

//         setIsLoading(true);
//         setError(null);

//         try {
//             const response = await fetch(`${API_BASE_URL}/campaigns/${userId}`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(formData)
//             });

//             if (!response.ok) throw new Error('Failed to create campaign');
//             const data = await response.json();

//             setCampaigns([data, ...campaigns]);
//             setShowCreateForm(false);
//             setFormData({ name: '', purpose: '', script_text: '' });
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Update campaign
//     const updateCampaign = async () => {
//         if (!editingCampaign) return;

//         if (!formData.name.trim()) {
//             setError('Campaign name is required');
//             return;
//         }

//         setIsLoading(true);
//         setError(null);

//         try {
//             const response = await fetch(`${API_BASE_URL}/campaigns/${userId}/${editingCampaign.id}`, {
//                 method: 'PUT',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(formData)
//             });

//             if (!response.ok) throw new Error('Failed to update campaign');
//             const data = await response.json();

//             setCampaigns(campaigns.map(c => c.id === data.id ? data : c));
//             setEditingCampaign(null);
//             setFormData({ name: '', purpose: '', script_text: '' });
//             if (selectedCampaign?.id === data.id) {
//                 setSelectedCampaign(data);
//             }
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Delete campaign
//     const deleteCampaign = async (campaignId) => {
//         if (!confirm('Are you sure you want to delete this campaign?')) return;

//         setIsLoading(true);
//         setError(null);

//         try {
//             const response = await fetch(`${API_BASE_URL}/campaigns/${userId}/${campaignId}`, {
//                 method: 'DELETE'
//             });

//             if (!response.ok) throw new Error('Failed to delete campaign');

//             setCampaigns(campaigns.filter(c => c.id !== campaignId));
//             if (selectedCampaign?.id === campaignId) {
//                 setSelectedCampaign(null);
//             }
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const startEdit = (campaign) => {
//         setEditingCampaign(campaign);
//         setFormData({
//             name: campaign.name,
//             purpose: campaign.purpose || '',
//             script_text: campaign.script_text || '',
//             status: campaign.status
//         });
//     };

//     const cancelEdit = () => {
//         setEditingCampaign(null);
//         setShowCreateForm(false);
//         setFormData({ name: '', purpose: '', script_text: '' });
//     };

//     const handleSubmit = () => {
//         if (editingCampaign) {
//             updateCampaign();
//         } else {
//             createCampaign();
//         }
//     };

//     // Show loading or auth error
//     if (!userId) {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
//                 <div className="bg-white rounded-lg shadow-md p-8 text-center">
//                     <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
//                     <p className="text-gray-600">Please sign in to access your campaigns.</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
//             <div className="max-w-7xl mx-auto">
//                 <div className="flex justify-between items-center mb-8">
//                     <h1 className="text-4xl font-bold text-gray-800">Campaign Manager</h1>
//                     <button
//                         onClick={() => setShowCreateForm(true)}
//                         className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
//                     >
//                         <Plus size={20} /> New Campaign
//                     </button>
//                 </div>

//                 {/* Error Display */}
//                 {error && (
//                     <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
//                         {error}
//                     </div>
//                 )}

//                 {/* Create/Edit Form */}
//                 {(showCreateForm || editingCampaign) && (
//                     <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//                         <h2 className="text-2xl font-semibold mb-4">
//                             {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
//                         </h2>
//                         <div className="space-y-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Campaign Name *
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={formData.name}
//                                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     placeholder="Enter campaign name"
//                                 />
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Purpose
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={formData.purpose}
//                                     onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
//                                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     placeholder="What is this campaign for?"
//                                 />
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Script Text
//                                 </label>
//                                 <textarea
//                                     value={formData.script_text}
//                                     onChange={(e) => setFormData({ ...formData, script_text: e.target.value })}
//                                     rows={6}
//                                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     placeholder="Enter your campaign script..."
//                                 />
//                             </div>

//                             {editingCampaign && (
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Status
//                                     </label>
//                                     <select
//                                         value={formData.status}
//                                         onChange={(e) => setFormData({ ...formData, status: e.target.value })}
//                                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     >
//                                         <option value="Active">Active</option>
//                                         <option value="Inactive">Inactive</option>
//                                         <option value="Paused">Paused</option>
//                                     </select>
//                                 </div>
//                             )}

//                             <div className="flex gap-4">
//                                 <button
//                                     onClick={handleSubmit}
//                                     disabled={isLoading}
//                                     className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
//                                 >
//                                     <Save size={20} />
//                                     {editingCampaign ? 'Update' : 'Create'}
//                                 </button>
//                                 <button
//                                     onClick={cancelEdit}
//                                     className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors flex items-center gap-2"
//                                 >
//                                     <X size={20} />
//                                     Cancel
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* Campaigns Grid */}
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                     {/* Campaigns List */}
//                     <div className="bg-white rounded-lg shadow-md p-6">
//                         <h2 className="text-2xl font-semibold mb-4">Your Campaigns ({campaigns.length})</h2>
//                         {isLoading ? (
//                             <div className="text-center py-8 text-gray-500">Loading...</div>
//                         ) : campaigns.length === 0 ? (
//                             <div className="text-center py-8 text-gray-500">
//                                 No campaigns yet. Create your first campaign to get started!
//                             </div>
//                         ) : (
//                             <div className="space-y-4 max-h-[600px] overflow-y-auto">
//                                 {campaigns.map((campaign) => (
//                                     <div
//                                         key={campaign.id}
//                                         className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
//                                     >
//                                         <div className="flex justify-between items-start mb-2">
//                                             <div className="flex-1">
//                                                 <h3 className="text-lg font-semibold text-gray-800">
//                                                     {campaign.name}
//                                                 </h3>
//                                                 <p className="text-sm text-gray-600 mt-1">{campaign.purpose}</p>
//                                                 <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${campaign.status === 'Active'
//                                                     ? 'bg-green-100 text-green-800'
//                                                     : campaign.status === 'Paused'
//                                                         ? 'bg-yellow-100 text-yellow-800'
//                                                         : 'bg-gray-100 text-gray-800'
//                                                     }`}>
//                                                     {campaign.status}
//                                                 </span>
//                                             </div>
//                                         </div>
//                                         <div className="flex gap-2 mt-3">
//                                             <button
//                                                 onClick={() => fetchCampaign(campaign.id)}
//                                                 className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex items-center gap-1 text-sm"
//                                             >
//                                                 <Eye size={16} /> View
//                                             </button>
//                                             <button
//                                                 onClick={() => startEdit(campaign)}
//                                                 className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors flex items-center gap-1 text-sm"
//                                             >
//                                                 <Edit2 size={16} /> Edit
//                                             </button>
//                                             <button
//                                                 onClick={() => deleteCampaign(campaign.id)}
//                                                 className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors flex items-center gap-1 text-sm"
//                                             >
//                                                 <Trash2 size={16} /> Delete
//                                             </button>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//                     </div>

//                     {/* Campaign Details */}
//                     <div className="bg-white rounded-lg shadow-md p-6">
//                         <h2 className="text-2xl font-semibold mb-4">Campaign Details</h2>
//                         {selectedCampaign ? (
//                             <div className="space-y-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
//                                     <p className="text-lg font-semibold text-gray-800">{selectedCampaign.name}</p>
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-600 mb-1">Purpose</label>
//                                     <p className="text-gray-800">{selectedCampaign.purpose || 'N/A'}</p>
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
//                                     <span className={`inline-block px-3 py-1 text-sm rounded-full ${selectedCampaign.status === 'Active'
//                                         ? 'bg-green-100 text-green-800'
//                                         : selectedCampaign.status === 'Paused'
//                                             ? 'bg-yellow-100 text-yellow-800'
//                                             : 'bg-gray-100 text-gray-800'
//                                         }`}>
//                                         {selectedCampaign.status}
//                                     </span>
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-600 mb-1">Script</label>
//                                     <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
//                                         <pre className="whitespace-pre-wrap text-sm text-gray-800">
//                                             {selectedCampaign.script_text || 'No script text'}
//                                         </pre>
//                                     </div>
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-600 mb-1">Created</label>
//                                     <p className="text-sm text-gray-600">
//                                         {new Date(selectedCampaign.created_at).toLocaleString()}
//                                     </p>
//                                 </div>
//                                 {selectedCampaign.updated_at && (
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-600 mb-1">Last Updated</label>
//                                         <p className="text-sm text-gray-600">
//                                             {new Date(selectedCampaign.updated_at).toLocaleString()}
//                                         </p>
//                                     </div>
//                                 )}
//                             </div>
//                         ) : (
//                             <div className="text-center py-8 text-gray-500">
//                                 Select a campaign to view details
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }



"use client"
import { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, Eye, Save, X } from 'lucide-react';
import { useUser } from "../app/userProvider";
import { createClient } from '@supabase/supabase-js';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CampaignManager() {
    const user = useUser();
    const userId = user?.id;
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        purpose: '',
        script_text: '',
        agent_name: '',
        agent_gender: 'male'
    });

    // Fetch campaigns when userId changes
    useEffect(() => {
        if (userId) {
            fetchCampaigns();
        }
    }, [userId]);

    // Fetch all campaigns
    const fetchCampaigns = async () => {
        if (!userId) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/campaigns/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch campaigns');
            const data = await response.json();
            setCampaigns(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch single campaign
    const fetchCampaign = async (campaignId) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/campaigns/${userId}/${campaignId}`);
            if (!response.ok) throw new Error('Campaign not found');
            const data = await response.json();
            setSelectedCampaign(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Create campaign
    const createCampaign = async () => {
        if (!formData.name.trim()) {
            setError('Campaign name is required');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/campaigns/${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();

                // Check if it's a foreign key constraint error
                if (errorData.detail && errorData.detail.includes('profiles')) {
                    throw new Error('User profile not found. Please contact support or try logging out and back in.');
                }

                throw new Error(errorData.detail || 'Failed to create campaign');
            }

            const data = await response.json();

            setCampaigns([data, ...campaigns]);
            setShowCreateForm(false);
            setFormData({ name: '', purpose: '', script_text: '', agent_name: '', agent_gender: 'male' });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Update campaign
    const updateCampaign = async () => {
        if (!editingCampaign) return;

        if (!formData.name.trim()) {
            setError('Campaign name is required');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/campaigns/${userId}/${editingCampaign.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to update campaign');
            const data = await response.json();

            setCampaigns(campaigns.map(c => c.id === data.id ? data : c));
            setEditingCampaign(null);
            setFormData({ name: '', purpose: '', script_text: '', agent_name: '', agent_gender: 'male' });
            if (selectedCampaign?.id === data.id) {
                setSelectedCampaign(data);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Delete campaign
    const deleteCampaign = async (campaignId) => {
        if (!confirm('Are you sure you want to delete this campaign?')) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/campaigns/${userId}/${campaignId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete campaign');

            setCampaigns(campaigns.filter(c => c.id !== campaignId));
            if (selectedCampaign?.id === campaignId) {
                setSelectedCampaign(null);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const startEdit = (campaign) => {
        setEditingCampaign(campaign);
        setFormData({
            name: campaign.name,
            purpose: campaign.purpose || '',
            script_text: campaign.script_text || '',
            agent_name: campaign.agent_name || '',
            agent_gender: campaign.agent_gender || 'male',
            status: campaign.status
        });
    };

    const cancelEdit = () => {
        setEditingCampaign(null);
        setShowCreateForm(false);
        setFormData({ name: '', purpose: '', script_text: '', agent_name: '', agent_gender: 'male' });
    };

    const handleSubmit = () => {
        if (editingCampaign) {
            updateCampaign();
        } else {
            createCampaign();
        }
    };

    // Show loading or auth error
    if (!userId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
                    <p className="text-gray-600">Please sign in to access your campaigns.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">Campaign Manager</h1>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                        <Plus size={20} /> New Campaign
                    </button>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Create/Edit Form */}
                {(showCreateForm || editingCampaign) && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-2xl font-semibold mb-4">
                            {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
                        </h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Campaign Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter campaign name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Agent Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.agent_name}
                                        onChange={(e) => setFormData({ ...formData, agent_name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Leave blank to use profile default"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Optional: Override default agent name</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Purpose
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.purpose}
                                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="What is this campaign for?"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Agent Gender *
                                    </label>
                                    <select
                                        value={formData.agent_gender}
                                        onChange={(e) => setFormData({ ...formData, agent_gender: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="male">Male Voice</option>
                                        <option value="female">Female Voice</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Script Text
                                </label>
                                <textarea
                                    value={formData.script_text}
                                    onChange={(e) => setFormData({ ...formData, script_text: e.target.value })}
                                    rows={6}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter your campaign script..."
                                />
                            </div>

                            {editingCampaign && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Paused">Paused</option>
                                    </select>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
                                >
                                    <Save size={20} />
                                    {editingCampaign ? 'Update' : 'Create'}
                                </button>
                                <button
                                    onClick={cancelEdit}
                                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors flex items-center gap-2"
                                >
                                    <X size={20} />
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Campaigns Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Campaigns List */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-semibold mb-4">Your Campaigns ({campaigns.length})</h2>
                        {isLoading ? (
                            <div className="text-center py-8 text-gray-500">Loading...</div>
                        ) : campaigns.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No campaigns yet. Create your first campaign to get started!
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[600px] overflow-y-auto">
                                {campaigns.map((campaign) => (
                                    <div
                                        key={campaign.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-800">
                                                    {campaign.name}
                                                </h3>
                                                {campaign.agent_name && (
                                                    <p className="text-xs text-blue-600 mt-1">👤 {campaign.agent_name}</p>
                                                )}
                                                <p className="text-sm text-gray-600 mt-1">{campaign.purpose}</p>
                                                <div className="flex gap-2 mt-2">
                                                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${campaign.status === 'Active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : campaign.status === 'Paused'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {campaign.status}
                                                    </span>
                                                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${campaign.agent_gender === 'female'
                                                        ? 'bg-pink-100 text-pink-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {campaign.agent_gender === 'female' ? '♀ Female' : '♂ Male'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={() => fetchCampaign(campaign.id)}
                                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex items-center gap-1 text-sm"
                                            >
                                                <Eye size={16} /> View
                                            </button>
                                            <button
                                                onClick={() => startEdit(campaign)}
                                                className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors flex items-center gap-1 text-sm"
                                            >
                                                <Edit2 size={16} /> Edit
                                            </button>
                                            <button
                                                onClick={() => deleteCampaign(campaign.id)}
                                                className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors flex items-center gap-1 text-sm"
                                            >
                                                <Trash2 size={16} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Campaign Details */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-semibold mb-4">Campaign Details</h2>
                        {selectedCampaign ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                                    <p className="text-lg font-semibold text-gray-800">{selectedCampaign.name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Agent Name</label>
                                    <p className="text-gray-800">{selectedCampaign.agent_name || 'Using profile default'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Agent Gender</label>
                                    <p className="text-gray-800">{selectedCampaign.agent_gender === 'female' ? '♀ Female Voice' : '♂ Male Voice'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Purpose</label>
                                    <p className="text-gray-800">{selectedCampaign.purpose || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                                    <span className={`inline-block px-3 py-1 text-sm rounded-full ${selectedCampaign.status === 'Active'
                                        ? 'bg-green-100 text-green-800'
                                        : selectedCampaign.status === 'Paused'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {selectedCampaign.status}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Script</label>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
                                        <pre className="whitespace-pre-wrap text-sm text-gray-800">
                                            {selectedCampaign.script_text || 'No script text'}
                                        </pre>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Created</label>
                                    <p className="text-sm text-gray-600">
                                        {new Date(selectedCampaign.created_at).toLocaleString()}
                                    </p>
                                </div>
                                {selectedCampaign.updated_at && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Last Updated</label>
                                        <p className="text-sm text-gray-600">
                                            {new Date(selectedCampaign.updated_at).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                Select a campaign to view details
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}