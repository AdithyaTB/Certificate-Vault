const Certificate = require('../models/Certificate');
const Category = require('../models/Category');

// @desc    Get dashboard analytics
// @route   GET /api/analytics
// @access  Private
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Total certificates count & total storage
        const overview = await Certificate.aggregate([
            { $match: { user: userId } },
            {
                $group: {
                    _id: null,
                    totalCertificates: { $sum: 1 },
                    totalStorageUsed: { $sum: '$size' },
                },
            },
        ]);

        const totalCertificates = overview.length > 0 ? overview[0].totalCertificates : 0;
        const totalStorageUsed = overview.length > 0 ? overview[0].totalStorageUsed : 0;

        // 2. Category-wise distribution
        const categoryDistribution = await Certificate.aggregate([
            { $match: { user: userId } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "_id",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            {
                $project: {
                    categoryId: '$_id',
                    count: 1,
                    name: { $arrayElemAt: ['$categoryDetails.name', 0] },
                    color: { $arrayElemAt: ['$categoryDetails.color', 0] }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Clean up null categories (uncategorized)
        const formattedCategories = categoryDistribution.map(cat => ({
            categoryId: cat.categoryId,
            name: cat.categoryId === null ? 'Uncategorized' : cat.name,
            color: cat.categoryId === null ? '#9ca3af' : cat.color,
            count: cat.count
        }));

        // 3. Folder distribution
        const folderDistribution = await Certificate.aggregate([
            { $match: { user: userId } },
            {
                $group: {
                    _id: '$folder',
                    count: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: "folders",
                    localField: "_id",
                    foreignField: "_id",
                    as: "folderDetails"
                }
            },
            {
                $project: {
                    folderId: '$_id',
                    count: 1,
                    name: { $arrayElemAt: ['$folderDetails.name', 0] }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const formattedFolders = folderDistribution.map(f => ({
            folderId: f.folderId,
            name: f.folderId === null ? 'All Certificates (Unsorted)' : f.name,
            count: f.count
        }));

        // 4. Skills analytics (Unwind skills array and count occurrences)
        const skillsAnalytics = await Certificate.aggregate([
            { $match: { user: userId } },
            { $unwind: "$skills" },
            {
                $group: {
                    _id: "$skills",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 },
            {
                $project: {
                    skill: '$_id',
                    count: 1,
                    _id: 0
                }
            }
        ]);


        // 5. Monthly upload stats (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyStats = await Certificate.aggregate([
            {
                $match: {
                    user: userId,
                    createdAt: { $gte: sixMonthsAgo },
                },
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" }
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Format monthly string labels
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const formattedMonthlyStats = monthlyStats.map(stat => ({
            month: monthNames[stat._id.month - 1],
            year: stat._id.year,
            count: stat.count
        }));

        // 6. Recent uploads timeline (last 5)
        const recentUploads = await Certificate.find({ user: userId })
            .sort('-createdAt')
            .limit(5)
            .populate('category', 'name color')
            .populate('folder', 'name');

        res.status(200).json({
            totalCertificates,
            totalStorageUsed,
            categoryDistribution: formattedCategories,
            folderDistribution: formattedFolders,
            skillsAnalytics,
            monthlyStats: formattedMonthlyStats,
            recentUploads,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats,
};
