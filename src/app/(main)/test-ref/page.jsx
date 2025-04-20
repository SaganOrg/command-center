"use client"
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  

function ReferenceItems() {
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login"; // Redirect to login
        return;
      }
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) {
        console.error("Error fetching user:", error);
        return;
      }
        setUser(data);
        console.log(data,"alskdjflkasjf alskdjf laksdf lkasjdf")
      setUserRole(data.role);
    };
    getUser();
  }, []);

  return (
    <div>
      <h1>Reference Items</h1>
          <p>User Role: {userRole || "Loading..."}</p>
          <p>{ user?.role}</p>
    </div>
  );
}

export default ReferenceItems;