const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

// Get all pets with optional filters
router.get('/', async (req, res) => {
  try {
    const { species, location, status } = req.query;
    const filter = {};

    if (species) filter.species = species;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (status) filter.status = status;

    const pets = await Pet.find(filter)
      .populate('owner', 'username email')
      .sort({ createdAt: -1 });

    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pets', error: error.message });
  }
});

// Get single pet
router.get('/:id', async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id)
      .populate('owner', 'username email');
    
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    res.json(pet);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pet', error: error.message });
  }
});

// Create new pet with image upload
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    
    const pet = new Pet({
      ...req.body,
      images: imageUrls,
      owner: req.user._id
    });

    await pet.save();
    res.status(201).json(pet);
  } catch (error) {
    // If there's an error, delete uploaded files
    if (req.files) {
      req.files.forEach(file => {
        fs.unlinkSync(file.path);
      });
    }
    res.status(500).json({ message: 'Error creating pet', error: error.message });
  }
});

// Update pet with image upload
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    // Check if user is the owner
    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this pet' });
    }

    // Handle new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map(file => `/uploads/${file.filename}`);
      
      // Delete old images
      pet.images.forEach(imageUrl => {
        const imagePath = path.join(__dirname, '..', imageUrl);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });

      req.body.images = newImageUrls;
    }

    const updatedPet = await Pet.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    res.json(updatedPet);
  } catch (error) {
    // If there's an error, delete uploaded files
    if (req.files) {
      req.files.forEach(file => {
        fs.unlinkSync(file.path);
      });
    }
    res.status(500).json({ message: 'Error updating pet', error: error.message });
  }
});

// Delete pet
router.delete('/:id', auth, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    // Check if user is the owner
    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this pet' });
    }

    // Delete associated images
    pet.images.forEach(imageUrl => {
      const imagePath = path.join(__dirname, '..', imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });

    await pet.remove();
    res.json({ message: 'Pet removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting pet', error: error.message });
  }
});

// Get user's pets
router.get('/user/pets', auth, async (req, res) => {
  try {
    const pets = await Pet.find({ owner: req.user._id })
      .sort({ createdAt: -1 });
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user pets', error: error.message });
  }
});

module.exports = router; 