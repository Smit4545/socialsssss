// "use client";

// import { useState, useEffect } from "react";
// import axios from "axios";
// import Link from "next/link";

// export default function Friends() {
//   const userId = localStorage.getItem("userId");
//   const [friends, setFriends] = useState([]);
//   const [pendingRequests, setPendingRequests] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const friendsRes = await axios.get(`/api/friends/${userId}`);
//         setFriends(friendsRes.data.friends);

//         const res = await axios.get(`/api/showreq/${userId}`);
//         setPendingRequests(res.data.pendingRequests);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     };
//     fetchData();
//   }, [userId]);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 py-10 px-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Page Header */}
//         <div className="flex flex-col md:flex-row items-center justify-between mb-10">
//           <h1 className="text-5xl font-extrabold text-white text-center md:text-left mb-6 md:mb-0 drop-shadow-lg">
//             Your Friends 👥
//           </h1>
//           <Link href="/friends/add">
//             <button className="bg-white text-purple-600 font-bold py-3 px-8 rounded-lg shadow-lg hover:scale-105 hover:bg-purple-600 hover:text-white transition-all duration-300">
//               ➕ Add New Friends
//             </button>
//           </Link>
//         </div>

//         {/* Friends Section */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//           {friends?.length > 0 ? (
//             friends.map((friend) => (
//               <div
//                 key={friend._id}
//                 className="bg-white/20 backdrop-blur-md shadow-xl rounded-lg p-6 flex flex-col items-center hover:shadow-2xl transition-transform transform hover:scale-105 border border-white/30"
//               >
//                 {/* Friend Avatar */}
//                 <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-md mb-4">
//                   {friend.name[0].toUpperCase()}
//                 </div>
//                 {/* Friend Details */}
//                 <h3 className="text-2xl font-semibold uppercase text-white">{friend.name}</h3>
//                 <p className="text-gray-200">{friend.email}</p>
//                 {/* Chat Button */}
//                 <Link href={`/friends/${friend.userId}/${friend.name}`} className="w-full">
//                   <button className="mt-6 w-full bg-white text-purple-600 font-bold py-2 rounded-full shadow-md hover:scale-105 hover:bg-purple-600 hover:text-white transition-all duration-300">
//                     💬 Chat
//                   </button>
//                 </Link>
//               </div>
//             ))
//           ) : (
//             <p className="text-white text-lg col-span-3 text-center">
//               You have no friends yet. 😢
//             </p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
import Link from "next/link";
import { cookies } from "next/headers";

async function getFriends(userId) {
  try {
    const friendsRes = await fetch(`${process.env.URL}/api/friends/${userId}`);
    const reqRes = await fetch(`${process.env.URL}/api/showreq/${userId}`, {
      cache: "no-store",
    });

    if (!friendsRes.ok || !reqRes.ok) throw new Error("Failed to fetch data");

    const friendsData = await friendsRes.json();
    const reqData = await reqRes.json();

    return { friends: friendsData.friends, pendingRequests: reqData.pendingRequests };
  } catch (error) {
    console.error("Error fetching data:", error);
    return { friends: [], pendingRequests: [] };
  }
}

export default async function FriendsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return <p className="text-white text-lg text-center">User not logged in.</p>;

  const { friends } = await getFriends(userId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-10">
          <h1 className="text-5xl font-extrabold text-white text-center md:text-left mb-6 md:mb-0 drop-shadow-lg">
            Your Friends 👥
          </h1>
          <Link href="/friends/add">
            <button className="bg-white text-purple-600 font-bold py-3 px-8 rounded-lg shadow-lg hover:scale-105 hover:bg-purple-600 hover:text-white transition-all duration-300">
              ➕ Add New Friends
            </button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {friends.length > 0 ? (
            friends.map((friend) => (
              <div
                key={friend._id}
                className="bg-white/20 backdrop-blur-md shadow-xl rounded-lg p-6 flex flex-col items-center hover:shadow-2xl transition-transform transform hover:scale-105 border border-white/30"
              >
                <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-md mb-4">
                  {friend.name[0].toUpperCase()}
                </div>
                <h3 className="text-2xl font-semibold uppercase text-white">{friend.name}</h3>
                <p className="text-gray-200">{friend.email}</p>
                <ChatButton userId={friend.userId} name={friend.name} />
              </div>
            ))
          ) : (
            <p className="text-white text-lg col-span-3 text-center">You have no friends yet. 😢</p>
          )}
        </div>
      </div>
    </div>
  );
}
function ChatButton({ userId, name }) {
  return (
    <Link href={`/friends/${userId}/${name}`} className="w-full">
      <button className="mt-6 w-full bg-white text-purple-600 font-bold py-2 rounded-full shadow-md hover:scale-105 hover:bg-purple-600 hover:text-white transition-all duration-300">
        💬 Chat
      </button>
    </Link>
  );
}
