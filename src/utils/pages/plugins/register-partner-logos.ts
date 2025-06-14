import { Editor } from "grapesjs";

export function registerPartnerLogos(editor: Editor) {
  editor.BlockManager.add("horizontal-scroll-logos", {
    label: "Partner Logos",
    category: "Sections",
    content: `
          <div style="overflow-x: scroll; white-space: nowrap; padding: 10px; background: #eee;">
            <div style="display: inline-flex; gap: 40px; align-items: center;">
              <div style="display: inline-flex; flex-direction: row; align-items: center;">
                <img src="logo1.png" style="height: 40px;" />
                <span style="font-weight: bold;">Scholarvein</span>
              </div>
              <div style="display: inline-flex; flex-direction: row; align-items: center;">
                <img src="logo2.png" style="height: 40px;" />
                <span style="font-weight: bold;">Reviewer Track</span>
              </div>
              <div style="display: inline-flex; flex-direction: row; align-items: center;">
                <img src="logo3.png" style="height: 40px;" />
                <span style="font-weight: bold;">Research Synergy Institute</span>
              </div>
            </div>
          </div>
        `,
  });
}
