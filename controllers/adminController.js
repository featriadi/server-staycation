const Category = require('../models/Category');
const Bank = require('../models/Bank');
const Item = require('../models/Item');
const Image = require('../models/Image');
const Feature = require('../models/Feature');
const Activity = require('../models/Activity');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    viewDashboard: (req, res) => {
        res.render('admin/dashboard/view_dashboard', {
            title : "Dashboard"
        });
    },

    //Category
    viewCategory: async (req, res) => {
        try {
            const category = await Category.find();
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = { message: alertMessage, status: alertStatus };
            res.render('admin/category/view_category', { 
                category,
                alert,
                title : "Category"
            });
        } catch (error) {
            res.redirect('/admin/category');
        }
    },
    addCategory: async (req, res) => {
        try {
            const { name } = req.body;
            await Category.create({ name });

            req.flash('alertMessage', 'Success Add Category');
            req.flash('alertStatus', 'Success');
            res.redirect('/admin/category');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/category');
        }
    },
    editCategory: async (req, res) => {
        try {
            const { id, name } = req.body;
            const category = await Category.findOne({ _id: id });
            
            category.name = name;
            await category.save();
    
            req.flash('alertMessage', 'Success Update Category');
            req.flash('alertStatus', 'Success');
            res.redirect('/admin/category');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/category');
        }
    },
    deleteCategory: async (req, res) => {
        try {
            const { id } = req.params;
            const category = await Category.findOne({ _id: id });
    
            category.remove();
            req.flash('alertMessage', 'Success Delete Category');
            req.flash('alertStatus', 'Success');
            res.redirect('/admin/category');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/category');
        }
    },

    //Bank
    viewBank: async (req, res) => {
        try {
            const bank = await Bank.find();

            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = { message: alertMessage, status: alertStatus };

            res.render('admin/bank/view_bank', {
                alert,
                bank,
                title : "Bank"
            });
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');

            res.redirect('/admin/bank');
        }
    },

    addBank: async (req, res) => {
        try {
            const { nameBank, nomorRekening, name } = req.body;
            
            await Bank.create({
                nameBank,
                nomorRekening, 
                name,
                imageUrl : `images/${req.file.filename}`
            });

            req.flash('alertMessage', 'Success Add Bank');
            req.flash('alertStatus', 'Success');

            res.redirect('/admin/bank');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'Error');

            res.redirect('/admin/bank');
        }
    },

    editBank: async (req, res) => {
        try {
            const {
                id,
                nameBank,
                nomorRekening,
                name
            } = req.body;
            
            const bank = await Bank.findOne({
                _id: id
            });
            
            if (req.file == undefined) {
                bank.nameBank = nameBank;
                bank.nomorRekening = nomorRekening;
                bank.name = name;
                
                await bank.save();
                
                req.flash('alertMessage', 'Success Update Bank');
                req.flash('alertStatus', 'Success');
                
                res.redirect('/admin/bank');
            } else {
                await fs.unlink(path.join(`public/${bank.imageUrl}`));

                bank.nameBank = nameBank;
                bank.nomorRekening = nomorRekening;
                bank.name = name;
                bank.imageUrl = `images/${req.file.filename}`;
                
                await bank.save();
                
                req.flash('alertMessage', 'Success Update Bank');
                req.flash('alertStatus', 'Success');
                
                res.redirect('/admin/bank');
            }
            
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'Error');

            res.redirect('/admin/bank');
        }
    },

    deleteBank: async (req, res) => {
        try {
            const { id } = req.params;
            const bank = await Bank.findOne({ _id: id });
            
            await fs.unlink(path.join(`public/${bank.imageUrl}`));
            bank.remove();

            req.flash('alertMessage', 'Success Delete Bank');
            req.flash('alertStatus', 'Success');
            res.redirect('/admin/bank');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/bank');
        }
    },
    
    //Item
    viewItem: async (req, res) => {
        try {
            const item = await Item.find()
                .populate({ path: 'imageId', select: 'id imageUrl' })
                .populate({ path: 'categoryId', select: 'id name' });
            
            const category = await Category.find();
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = { message: alertMessage, status: alertStatus };

            res.render('admin/item/view_item', {
                item,
                category,
                title : "Item",
                alert,
                action: 'view'
            });
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/item');
        }
    },

    addItem: async (req, res) => {
        try {
            const {
                categoryId,
                title,
                price,
                city,
                about
            } = req.body;

            if (req.files.length > 0) {
                const category = await Category.findOne({ _id: categoryId});
    
                const newItem = {
                    categoryId,
                    title,
                    description: about,
                    price,
                    city
                };
    
                const item = await Item.create(newItem);
                category.itemId.push({ _id: item._id });
                await category.save();

                for (let index = 0; index < req.files.length; index++) {
                    const imageSave = await Image.create({ imageUrl: `images/${req.files[index].filename}` });
                    item.imageId.push({ _id: imageSave._id });
                    await item.save();
                }

                req.flash('alertMessage', 'Success Add Item');
                req.flash('alertStatus', 'Success');
                res.redirect('/admin/item');
            }

        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/item');
        }
    },

    showImageItem: async (req, res) => {
        try {
            const { id } = req.params;

            const item = await Item.findOne({ _id: id})
                .populate({ path: 'imageId', select: 'id imageUrl' });
            
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = { message: alertMessage, status: alertStatus };

            res.render('admin/item/view_item', {
                item,
                title : "Show Image Item",
                alert,
                action: 'show image'
            });
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/item');
        }
    },

    showEditItem: async (req, res) => {
        try {
            const { id } = req.params;

            const item = await Item.findOne({ _id: id})
                .populate({ path: 'imageId', select: 'id imageUrl' })
                .populate({ path: 'categoryId', select: 'id name' });

            const category = await Category.find();
            
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = { message: alertMessage, status: alertStatus };

            res.render('admin/item/view_item', {
                item,
                title : "Edit Item",
                alert,
                category,
                action: 'edit'
            });
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/item');
        }
    },

    editItem: async (req, res) => {
        try {
            const { id } = req.params;

            const {
                categoryId,
                title,
                price,
                city,
                about
            } = req.body;
            
            const item = await Item.findOne({ _id: id})
                .populate({ path: 'imageId', select: 'id imageUrl' })
                .populate({ path: 'categoryId', select: 'id name' });
            
            if (req.files.length > 0) {
                for (let index = 0; index < item.imageId.length; index++) {
                    const imageUpdate = await Image.findOne({ _id: item.imageId[index]._id });
                    await fs.unlink(path.join(`public/${imageUpdate.imageUrl}`));
                    imageUpdate.imageUrl = `images/${req.files[index].filename}`;
                    await imageUpdate.save();
                }
            }

            item.title = title;
            item.price = price;
            item.city = city;
            item.description = about;
            item.categoryId = categoryId;
            
            await item.save();
            
            req.flash('alertMessage', 'Success Update Item');
            req.flash('alertStatus', 'Success');
            res.redirect('/admin/item');

        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/item');
        }
    },

    deleteItem: async (req, res) => {
        try {
            const { id } = req.params;
            const item = await Item.findOne({ _id: id}).populate('imageId');
            
            for (let index = 0; index < item.imageId.length; index++) {
                Image.findOne({ _id: item.imageId[index]._id }).then((image) => {
                    fs.unlink(path.join(`public/${image.imageUrl}`));
                    image.remove();
                }).catch((error) => {
                    req.flash('alertMessage', `${error.message}`);
                    req.flash('alertStatus', 'danger');
                    res.redirect('/admin/item');
                });
            }

            await item.remove();

            req.flash('alertMessage', 'Success Delete Item');
            req.flash('alertStatus', 'Success');
            res.redirect('/admin/item');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/item');
        }
    },

    viewDetailItem: async (req, res) => {
        try {
            const { itemId } = req.params;

            const feature = await Feature.find({ itemId: itemId });
            const activity = await Activity.find({ itemId: itemId });

            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = { message: alertMessage, status: alertStatus };
            res.render('admin/item/detail_item/view_detail_item', {
                title: 'Detail Item',
                alert,
                itemId,
                feature,
                activity
            });
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect(`/admin/item/show-detail-item/${itemId}`);
        }
    },

    addFeature: async (req, res) => {
        const { name, qty, itemId } = req.body;
        try {
            if(!req.file){
                req.flash('alertMessage', 'Image Not Found');
                req.flash('alertStatus', 'Error');

                res.redirect(`/admin/item/show-detail-item/${itemId}`);
            }

            const feature = await Feature.create({
                name,
                qty,
                itemId,
                imageUrl : `images/${req.file.filename}`
            });

            const item = await Item.findOne({ _id: itemId });
            item.featureId.push({ _id: feature._id });
            await item.save();

            req.flash('alertMessage', 'Success Add Feature');
            req.flash('alertStatus', 'Success');

            res.redirect(`/admin/item/show-detail-item/${itemId}`);
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'Error');

            res.redirect(`/admin/item/show-detail-item/${itemId}`);
        }
    },

    editFeature: async (req, res) => {
        const {
            id,
            name,
            qty,
            itemId
        } = req.body;
        console.log('hello');
        try {
            const feature = await Feature.findOne({
                _id: id
            });
            console.log('hello');
            if (req.file == undefined) {
                feature.name = name;
                feature.qty = qty;
                
                await feature.save();
                console.log('hello');
                
                req.flash('alertMessage', 'Success Update Feature');
                req.flash('alertStatus', 'Success');
                
                res.redirect(`/admin/item/show-detail-item/${itemId}`);
            } else {
                await fs.unlink(path.join(`public/${feature.imageUrl}`));

                feature.name = name;
                feature.qty = qty;
                feature.imageUrl = `images/${req.file.filename}`;
                
                await feature.save();
                
                req.flash('alertMessage', 'Success Update Feature');
                req.flash('alertStatus', 'Success');

                res.redirect(`/admin/item/show-detail-item/${itemId}`);
            }
            
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'Error');

            res.redirect(`/admin/item/show-detail-item/${itemId}`);
        }
    },

    deleteFeature: async (req, res) => {
        const { id, itemId } = req.params;
        
        try {
            const feature = await Feature.findOne({ _id: id });
            const item = await Item.findOne({ _id: itemId}).populate('featureId');

            for (let index = 0; index < item.featureId.length; index++) {
                if (item.featureId[index]._id.toString() === feature._id.toString()) {
                    item.featureId.pull({ _id: feature._id });
                    await item.save();
                }
            }

            await fs.unlink(path.join(`public/${feature.imageUrl}`));
            feature.remove();

            req.flash('alertMessage', 'Success Delete Feature');
            req.flash('alertStatus', 'Success');

            res.redirect(`/admin/item/show-detail-item/${itemId}`);
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'Error');

            res.redirect(`/admin/item/show-detail-item/${itemId}`);
        }
    },

    addActivity: async (req, res) => {
        const { name, type, itemId } = req.body;
        try {
            if(!req.file){
                req.flash('alertMessage', 'Image Not Found');
                req.flash('alertStatus', 'Error');

                res.redirect(`/admin/item/show-detail-item/${itemId}`);
            }

            const activity = await Activity.create({
                name,
                type,
                itemId,
                imageUrl : `images/${req.file.filename}`
            });

            const item = await Item.findOne({ _id: itemId });
            item.activityId.push({ _id: activity._id });
            await item.save();

            req.flash('alertMessage', 'Success Add Activity');
            req.flash('alertStatus', 'Success');

            res.redirect(`/admin/item/show-detail-item/${itemId}`);
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'Error');

            res.redirect(`/admin/item/show-detail-item/${itemId}`);
        }
    },

    //Booking
    viewBooking: (req, res) => {
        res.render('admin/booking/view_booking', {
            title : "Booking"
        });
    },
}