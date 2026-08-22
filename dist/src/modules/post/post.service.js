"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostService = void 0;
const prisma_1 = require("../../lib/prisma");
const createPost = async (data, authorId) => {
    const result = await prisma_1.prisma.post.create({
        data: {
            ...data,
            authorId,
        },
    });
    return result;
};
const getAllPosts = async (payload) => {
    const andOperation = [];
    if (payload.search) {
        andOperation.push({
            OR: [
                {
                    title: {
                        contains: payload.search,
                        mode: "insensitive",
                    },
                },
                {
                    content: {
                        contains: payload.search,
                        mode: "insensitive",
                    },
                },
                {
                    tags: {
                        has: payload.search,
                    },
                },
            ],
        });
    }
    if (payload.tags.length > 0) {
        andOperation.push({
            tags: {
                hasEvery: payload.tags,
            },
        });
    }
    if (typeof payload.isFeatured === "boolean") {
        andOperation.push({
            isFeatured: payload.isFeatured,
        });
    }
    if (payload.status) {
        andOperation.push({
            status: payload.status,
        });
    }
    if (payload.authorId) {
        andOperation.push({
            authorId: payload.authorId,
        });
    }
    const result = await prisma_1.prisma.post.findMany({
        take: payload.limit,
        skip: payload.skip,
        where: {
            AND: andOperation,
        },
        orderBy: {
            [payload.sortBy]: payload.orderBy,
        },
    });
    const total = await prisma_1.prisma.post.count({
        where: {
            AND: andOperation,
        },
    });
    return {
        data: result,
        pagination: total,
        page: payload.page,
        limit: payload.limit,
        totalPage: Math.ceil(payload.page / payload.limit),
    };
};
const getPostById = async (postId) => {
    return await prisma_1.prisma.$transaction(async (tx) => {
        await tx.post.update({
            where: {
                id: postId,
            },
            data: {
                view: {
                    increment: 1,
                },
            },
        });
        const post = await tx.post.findUnique({
            where: { id: postId },
        });
        return post;
    });
};
exports.PostService = {
    createPost,
    getAllPosts,
    getPostById,
};
