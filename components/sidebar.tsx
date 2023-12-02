import { buttonVariants } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import Link from "next/link";
import { ChatsMenu } from "./chats-menu";

interface Product {
  name: string;
  path: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const mainProducts: Product[] = [
    {
      name: "Chat",
      path: "/chat",
    },
    {
      name: "Image",
      path: "/image",
    },
    {
      name: "Transcribe",
      path: "/transcribe",
    },
  ];

  return (
    <div className="pb-12 w-64 min-w-[16rem]">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Products
          </h2>
          <div className="space-y-1">
            {mainProducts.map((product: Product) => (
              <Link
                key={product.name}
                className={cn(
                  buttonVariants({
                    variant: pathname === product.path ? "secondary" : "ghost",
                  }),
                  "w-full justify-start",
                )}
                href={product.path}
              >
                {product.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
      {pathname === "/chat" && <ChatsMenu />}
    </div>
  );
}
