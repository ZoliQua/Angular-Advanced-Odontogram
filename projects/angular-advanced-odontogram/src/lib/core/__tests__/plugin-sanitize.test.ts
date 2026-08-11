import { describe, it, expect } from "vitest";
import { sanitizePluginSvg } from "../pluginSanitize";

describe("sanitizePluginSvg", () => {
  it("passes benign SVG fragments through with attributes intact", () => {
    const out = sanitizePluginSvg('<circle cx="10" cy="10" r="4" fill="red" />');
    expect(out).toContain("<circle");
    expect(out).toContain('fill="red"');
  });

  it("strips <script> elements", () => {
    const out = sanitizePluginSvg('<circle r="4" /><script>window.pwned = true<' + '/script>');
    expect(out).not.toContain("script");
    expect(out).toContain("<circle");
  });

  it("strips event-handler attributes", () => {
    const out = sanitizePluginSvg('<image href="x" onerror="window.pwned=true" />');
    expect(out).not.toContain("onerror");
  });

  it("strips foreignObject/iframe/object/embed vectors", () => {
    const out = sanitizePluginSvg('<foreignObject><iframe src="https://evil.example"></iframe></foreignObject><object data="x"></object><embed src="y" />');
    expect(out).not.toContain("iframe");
    expect(out).not.toContain("foreignObject");
    expect(out).not.toContain("object");
    expect(out).not.toContain("embed");
  });

  it("strips javascript: URLs", () => {
    const out = sanitizePluginSvg('<a href="javascript:window.pwned=true"><text>x</text></a>');
    expect(out).not.toContain("javascript:");
  });

  it("returns an empty string for wholly malicious input", () => {
    expect(sanitizePluginSvg("<script>1<" + "/script>")).toBe("");
  });

  it("discards a </svg><svg ...> breakout attempt instead of leaking it into the output", () => {
    // The parser treats the embedded </svg> as closing OUR wrapper root, so
    // the attacker's <svg onload=...> becomes a sibling of the wrapper, not
    // a child of it. A regex-based unwrap would strip only the first <svg…>
    // and the last </svg> of the whole sanitized string and let this sibling
    // leak through; the structural (DOM-walk) unwrap must exclude it
    // entirely.
    const out = sanitizePluginSvg('<circle/></svg><svg onload="alert(1)">');
    expect(out).not.toContain("<svg");
    expect(out).not.toContain("</svg>");
    expect(out).not.toContain("onload");
    expect(out).not.toContain("alert");
    expect(out).toContain("<circle");
  });

  it("preserves a plugin-supplied full <svg>...</svg> root and its children", () => {
    const out = sanitizePluginSvg('<svg><rect width="5" height="5" fill="blue" /></svg>');
    expect(out).toContain("<svg");
    expect(out).toContain("<rect");
    expect(out).toContain('width="5"');
    expect(out).toContain('fill="blue"');
  });

  it("preserves a legitimate nested <svg> inside a fragment", () => {
    const out = sanitizePluginSvg('<g><svg><rect width="3" height="3" /></svg></g>');
    expect(out).toContain("<g");
    expect(out).toContain("<svg");
    expect(out).toContain("<rect");
    expect(out).toContain('width="3"');
  });
});
