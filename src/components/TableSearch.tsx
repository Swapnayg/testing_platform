"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from 'react';


const TableSearch = () => {
  const router = useRouter();

  function handleChange(e: { target: { value: any; }; }) {
    const value = e.target.value;
    const params = new URLSearchParams(window.location.search);
    params.set("search", value);
    router.push(`${window.location.pathname}?${params}`);
  }


  return (
    <form
      className="w-full md:w-auto flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2"
    >
      <Image src="/search.png" alt="" width={14} height={14} />
      <input
        type="text"
        placeholder="Search..."
        onChange={handleChange}
        className="w-[200px] p-2 bg-transparent outline-none"
      />
    </form>
  );
};

export default TableSearch;
