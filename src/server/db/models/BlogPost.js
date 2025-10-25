"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogPost = void 0;
var mongoose_1 = require("mongoose");
var authorSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    avatar: { type: String, required: true },
});
var blogPostSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: String, required: true },
    author: { type: authorSchema, required: true },
    category: { type: String, required: true },
    readTime: { type: String, required: true },
    imageUrl: { type: String, required: true },
    tags: [{ type: String }],
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft',
    },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, {
    timestamps: true,
});
// Create indexes
blogPostSchema.index({ slug: 1 }, { unique: true });
blogPostSchema.index({ title: 'text', excerpt: 'text', content: 'text' });
exports.BlogPost = mongoose_1.default.models.BlogPost || mongoose_1.default.model('BlogPost', blogPostSchema);
