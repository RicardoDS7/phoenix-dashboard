
import Link from "next/link";
import { TiUserAdd } from "react-icons/ti";
import { MdRequestQuote } from "react-icons/md";
import { IoMdKey } from "react-icons/io";
import { FaUserEdit } from "react-icons/fa";
import { MdEditDocument } from "react-icons/md";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4">
      <h1 className="text-6xl font-black mb-16">Phoenix Energy Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        <Link href="./add-client"
              className="hover:bg-gray-200 transtion duration-100 p-4 rounded-lg shadow-md"
        >
          <div className="flex gap-6 justify-center items-center w-full h-full rounded">
            <TiUserAdd  size={25}/>
            <h2 className="text-2xl font-semibold text-center">Add New Client</h2>
          </div>

        </Link>

        <Link href="/edit-client"
              className="hover:bg-gray-200 transtion duration-100 p-4 rounded-lg shadow-md"
        >
          <div className="flex gap-6 justify-center items-center w-full h-full rounded">
            <FaUserEdit  size={25}/>
            <h2 className="text-2xl font-semibold text-center">Edit Existing Client</h2>
          </div>

        </Link>

        <Link href="./create-quote"
              className="hover:bg-gray-200 transtion duration-100 p-4 rounded-lg shadow-md"
        >
          <div className="flex gap-6 justify-center items-center w-full h-full rounded">
            <MdRequestQuote size={25}/>
            <h2 className="text-2xl font-semibold text-center">Create New Quote</h2>
          </div>

        </Link>

        <Link href="./edit-quote"
              className="hover:bg-gray-200 transtion duration-100 p-4 rounded-lg shadow-md"
        >
          <div className="flex gap-6 justify-center items-center w-full h-full rounded">
            <MdEditDocument size={25}/>
            <h2 className="text-2xl font-semibold text-center">Edit Existing Quote</h2>
          </div>

        </Link>

        <Link href="./create-project-summary"
              className="hover:bg-gray-200 transtion duration-100 p-4 rounded-lg shadow-md"
        >
          <div className="flex gap-6 justify-center items-center w-full h-full rounded">
            <IoMdKey  size={25}/>
            <h2 className="text-2xl font-semibold text-center">View Project Summary</h2>
          </div>

        </Link>

      </div>
    </div>
    
  );
}
