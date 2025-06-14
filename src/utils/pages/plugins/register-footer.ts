import { Editor } from "grapesjs";

export function registerFooter(editor: Editor) {
  //register default footer
  editor.BlockManager.add("custom-footer", {
    label: "Footer",
    category: "Basic",
    content: `
    <footer class="bg-[#1e4c56] text-white px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-6 text-sm">
        <!-- Logo + Contact Info -->
        <div class="col-span-1 space-y-4">
          <img src="https://via.placeholder.com/180x80?text=Logo" alt="Logo" class="mb-4">
          <p>123 Academic Avenue, Research Park, CA 94103</p>
          <p>📞 +1 (555) 123-4567</p>
          <p>✉️ contact@researchplatform.com</p>
        </div>

        <!-- Ecosystem -->
        <div>
          <h4 class="font-bold mb-2">Ecosystem</h4>
          <ul class="space-y-1">
            <li><a href="#">Research Journals</a></li>
            <li><a href="#">Conference Papers</a></li>
            <li><a href="#">Data Repository</a></li>
            <li><a href="#">Research Tools</a></li>
          </ul>
        </div>

        <!-- Join Us -->
        <div>
          <h4 class="font-bold mb-2">Join Us</h4>
          <ul class="space-y-1">
            <li><a href="#">For Researchers</a></li>
            <li><a href="#">For Reviewers</a></li>
            <li><a href="#">For Institutions</a></li>
            <li><a href="#">For Publishers</a></li>
          </ul>
        </div>

        <!-- Menu -->
        <div>
          <h4 class="font-bold mb-2">Menu</h4>
          <ul class="space-y-1">
            <li><a href="#">About Us</a></li>
            <li><a href="#">Our Team</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>

        <!-- Social Icons -->
        <div>
          <h4 class="font-bold mb-2">Follow Us</h4>
          <div class="flex gap-4">
            <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" class="w-5 h-5" alt="LinkedIn" /></a>
            <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" class="w-5 h-5" alt="Instagram" /></a>
            <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" class="w-5 h-5" alt="Facebook" /></a>
            <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/733/733646.png" class="w-5 h-5" alt="YouTube" /></a>
          </div>
        </div>
      </div>
    </footer>
  `,
  });
}
