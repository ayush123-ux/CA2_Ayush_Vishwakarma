const express = require('express');
const mongoose = require('mongoose');
const Book = require('./models/Book');
const mongoose = require("mongoose");

const app = express();

app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/libraryDB')
    .then(()=> console.log('MongoDB connected'))
    .catch(err=> console.log(err));


app.post('/api/books',(req, res) => {
        const {title, author, category} = req.body;

        if (!title) {
            return res.status(400).json({
                message: 'Title is required'
            })
        }

        const book = new Book({
            title,
            author,
            category
        });

         book.save();
        res.status(201).json(book);
     
        res.status(404).json({
            message:'cant add books'
        })
      
    }
)

app.get('/api/books', async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 5));

        const skip = (page - 1) * limit;

        const books = await Book.find()
            .skip(skip)
            .limit(limit);

        const total = await Book.countDocuments();

        res.status(200).json({
            books,
            currentPage: page,
            totalBooks: total
        });
    } catch (err) {
        res.status(500).json({
            message: 'Error fetching books'
        });
    }
});
app.patch('/api/books/:id',  (req, res) => {
        const {available}= req.body;
        if (typeof available!=='boolean') {
            return res.status(400).json({
                message: 'available must be in boolean'
            });
        }

        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: 'invalid book id'
            });
        }

        const book = Book.findByIdAndUpdate(
            req.params.id,
            { available },
            { new: true, runValidators: true }
        );
        if (!book) {
            return res.status(404).json({
                message: 'Book not found'
            });
        }
        res.status(200).json(book);
    
        res.status(500).json({
            message: 'Error updating book'
        });
    }
);

app.listen(3000, () => {
    console.log('Server running on port 3000');
});