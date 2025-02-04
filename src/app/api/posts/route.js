import dbConnect from '../../../dbconfig/db';
import Post from '../../../models/PostModel';
import User from '../../../models/userModel';  // Assuming you have a User model for the user data

export async function POST(req) {
  if (req.method === 'POST') {
    try {
      const { userId, content } = await req.json();  

      await dbConnect();

      // Find the user by userId to get the name
      const user = await User.findById(userId);

      if (!user) {
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { status: 404 }
        );
      }

      // Use the user name from the User model
      const newPost = new Post({
        userId,
        name: user.username,  // Use the name from the user model
        content,
      });

      await newPost.save();

      return new Response(
        JSON.stringify({ message: 'Post created successfully', post: newPost }),
        { status: 201 }
      );
    } catch (error) {
      console.error(error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500 }
      );
    }
  } else {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405 }
    );
  }
}
// import { NextResponse } from 'next/server';
// import dbConnect from '../../../dbconfig/db';
// import Post from '../../../models/PostModel';
// import User from '../../../models/userModel';
// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';

// // Ensure the 'uploads' directory exists
// const uploadPath = './public/uploads';
// if (!fs.existsSync(uploadPath)) {
//   fs.mkdirSync(uploadPath, { recursive: true });
// }

// // Set up multer storage
// const storage = multer.diskStorage({
//   destination: uploadPath,
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); // Save file with timestamp
//   },
// });

// const upload = multer({ storage });

// // Middleware to handle file upload
// const uploadMiddleware = upload.single('image');

// export async function POST(req) {
//   return new Promise((resolve, reject) => {
//     uploadMiddleware(req, {}, async (err) => {
//       if (err) {
//         return reject(new NextResponse(JSON.stringify({ error: 'Error uploading image' }), { status: 500 }));
//       }

//       try {
//         // Parse the form data
//         const formData = await req.formData(); // Correct way to parse form data in Next.js App Router
//         const userId = formData.get('userId');
//         const content = formData.get('content');

//         if (!userId || !content) {
//           return resolve(new NextResponse(JSON.stringify({ error: 'Missing fields' }), { status: 400 }));
//         }

//         // Ensure DB connection
//         await dbConnect();

//         // Validate user existence
//         const user = await User.findById(userId);
//         if (!user) {
//           return resolve(new NextResponse(JSON.stringify({ error: 'User not found' }), { status: 404 }));
//         }

//         // Get uploaded file URL if available
//         const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

//         // Create new post
//         const newPost = new Post({
//           userId,
//           name: user.username, // Fetch user name from DB
//           content,
//           image: imageUrl, // Store image URL
//         });

//         await newPost.save();

//         return resolve(new NextResponse(
//           JSON.stringify({ message: 'Post created successfully', post: newPost }),
//           { status: 201 }
//         ));
//       } catch (error) {
//         console.error(error);
//         return reject(new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 }));
//       }
//     });
//   });
// }

// export const config = {
//   api: {
//     bodyParser: false, // Important to allow multipart/form-data
//   },
// };



