import { Editor } from "grapesjs";

export function registerNavbar(editor: Editor) {
  //register default navbar
  editor.BlockManager.add("custom-navbar", {
    label: "Navbar",
    category: "Basic",
    content: `
    <header data-gjs-type="custom-navbar" class="w-full shadow-md">
      <div class="max-w-screen mx-auto px-4 py-4 flex items-center bg-gray-300 absolute top-0  justify-between">
        <div class="flex items-center gap-4 overflow-x-scroll">
          <img src="/uploads/logo-rsf-transparant.webp" alt="Logo" class="h-10"/>
          <nav class="hidden md:flex gap-6 text-sm font-medium">
            <a href="https://globalresearchecosystem.com/" class="relative text-blue-900 after:absolute after:left-0 after:-bottom-1 after:h-1 after:w-full after:bg-yellow-400">Home</a>
            <a href="/about">About</a>
            <a href="">Membership</a>
            <a href="/conferences">Conferences</a>
            <a href="/publications">Publication</a>
            <a href="/learnings">Learning</a>
            <a href="/articles">Updates</a>
          </nav>
        </div>
        <div class="hidden md:flex items-center gap-4">
          <div class="relative">
            <input type="text" placeholder="Search" class="pl-10 pr-4 py-2 border rounded-full" />
            <svg class="absolute left-3 top-2.5 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
          </div>
          <button class="bg-yellow-400 text-black font-semibold px-4 py-2 rounded-full">Join Us</button>
        </div>

        <!-- Burger -->
        <div class="md:hidden text-gray-700 burger-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu-icon lucide-menu"><path d="M4 12h16"/><path d="M4 18h16"/><path d="M4 6h16"/></svg>
        </div>
      </div>

      <!-- Mobile nav -->
      <div class="mobile-menu hidden md:hidden flex-col gap-4 px-4 pb-4">
        <nav class="flex flex-col gap-2 text-sm font-medium">
          <a href="#" class="text-blue-900">Home</a>
          <a href="/about">About</a>
          <a href="#">Membership</a>
          <a href="/conferneces">Conferences</a>
          <a href="/publications">Publication</a>
          <a href="/learning">Learning</a>
          <a href="/articles">Updates</a>
        </nav>
        <div class="mt-3">
          <input type="text" placeholder="Search" class="w-full pl-10 pr-4 py-2 border rounded-full relative" />
        </div>
      </div>
    </header>
  `,
  });

  // Register the custom component type to include script
  editor.DomComponents.addType("custom-navbar", {
    model: {
      defaults: {
        attributes: {
          class: "custom-navbar",
          "data-gjs-type": "custom-navbar",
        },
        script: function () {
          const burger = this.querySelector(".burger-btn");
          const menu = this.querySelector(".mobile-menu");
          if (burger && menu) {
            burger.addEventListener("click", () => {
              menu.classList.toggle("hidden");
            });
          }
        },
      },
    },
  });
}
