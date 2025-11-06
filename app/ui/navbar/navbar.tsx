"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  NavbarLogo,
  NavbarButton,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle
} from "@/components/ui/resizable-navbar";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Loader from "@/components/ui/loader";

interface User {
  email: string;
  displayName: string;
}

export default function NavigationBar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const navItems = [
    {
      name: "Home",
      href: "/"
    },
    {
      name: "Share Notes",
      href: "/navs/sharenotes"
    },
    {
      name: "Find Notes",
      href: "/navs/findnotes"
    },
    {
      name: "How to use",
      href: "#Hero2"
    },
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get("/api/user/verify", {
        withCredentials: true,
      });

      if (response.data.authenticated) {
        setIsAuthenticated(true);
        setUser(response.data.user);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Loader />
    );
  }

  const dashboard = () => {
    router.push("/navs/auth/userDashboard");
  }

  const handleLogout = async () => {
    setLoading(true)
    try {
      await axios.post("/api/user/logout", {}, {
        withCredentials: true,
      });

      setIsAuthenticated(false);
      setUser(null);
      setIsMenuOpen(false);
      router.push("/");
      setLoading(false)
    } catch (error) {
      console.error("Logout error:", error);
    }
  };


  return (
    <Navbar className="font-[roboto_Condensed]">
      <NavBody>
        <NavbarLogo />
        <NavItems  items={navItems.map(({ name, href } ) => ({ name, Link: href }))} />
        <div className="relative z-20 flex flex-row items-center space-x-2">
          {loading ? (
            <div className="h-9 w-32 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
          ) : isAuthenticated ? (
            <>
              <span className="hidden md:flex xl:h-10 xl:w-22 p-2 items-center justify-center rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer hover:bg-white/40" onClick={dashboard}>
                {user?.displayName}
              </span>
              <NavbarButton
                onClick={handleLogout}
                className="rounded-[1rem]"
              >
                Logout
              </NavbarButton>
            </>
          ) : (
            <>
              <NavbarButton variant="secondary" href="/navs/auth/login" className="rounded-[1rem]">
                Login
              </NavbarButton>
              <NavbarButton href="/navs/auth/signup" className="rounded-[1rem]">
                Sign Up
              </NavbarButton>
            </>
          )}
        </div>
      </NavBody>

      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle
            isOpen={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          />
        </MobileNavHeader>
        <MobileNavMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="w-full py-2 text-lg font-medium text-black dark:text-white"
              onClick={() => setIsMenuOpen(false)}
              prefetch={true}
            >
              {item.name}
            </Link>
          ))}
          <div className="mt-4 flex w-full flex-col items-center gap-2">
            {loading ? (
              <div className="h-10 w-full animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700 " />
            ) : isAuthenticated ? (
              <div className="flex gap-2">
                <div className="w-full p-2 text-center text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer" onClick={dashboard}>
                  Welcome, {user?.displayName}
                </div>
                <NavbarButton
                  onClick={handleLogout}
                  className="w-full rounded-[1rem] flex items-center justify-center"
                >
                  Logout
                </NavbarButton>
              </div>
            ) : (
              <>
                <NavbarButton variant="secondary" href="/navs/auth/login" className="w-full rounded-xl">
                  Login
                </NavbarButton>
                <NavbarButton href="/navs/auth/signup" className="w-full rounded-xl">
                  Sign Up
                </NavbarButton>
              </>
            )}
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}

