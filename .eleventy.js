const { DateTime } = require("luxon");
const CleanCSS = require("clean-css");
const UglifyJS = require("uglify-js");
const htmlmin = require("html-minifier");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const readingTime = require('eleventy-plugin-reading-time');
const pluginRss = require("@11ty/eleventy-plugin-rss");

module.exports = function(eleventyConfig) {

  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(readingTime);

  eleventyConfig.setDataDeepMerge(true);

  // Add a 'slice' filter to Nunjucks
  eleventyConfig.addNunjucksFilter("slice", function(arr, start, end) {
    return arr.slice(start, end);
  });
  // Custom Nunjucks filter to truncate content by words
  eleventyConfig.addNunjucksFilter("truncateWords", function(str, numWords) {
    if (!str) return '';
    const wordsArray = str.split(/\s+/); // Split by any whitespace character
    const truncated = wordsArray.slice(0, numWords).join(' ');
    return wordsArray.length > numWords ? `${truncated}...` : truncated;
  });
  // Date formatting (human readable)
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(new Date(dateObj)).toFormat("dd LLL yyyy");
  });

  // Time formatting (human readable)
  eleventyConfig.addFilter("readableTime", (dateObj) => {
    return DateTime.fromJSDate(new Date(dateObj)).toFormat("hh:mm a");
  });

  // Date formatting (machine readable)
  eleventyConfig.addFilter("machineDate", (dateObj) => {
    return DateTime.fromJSDate(new Date(dateObj)).toFormat("yyyy-MM-dd");
  });

  // Minify CSS
  eleventyConfig.addFilter("cssmin", function(code) {
    return new CleanCSS({}).minify(code).styles;
  });

  // Minify JS
  eleventyConfig.addFilter("jsmin", function(code) {
    let minified = UglifyJS.minify(code);
    if (minified.error) {
      console.log("UglifyJS error: ", minified.error);
      return code;
    }
    return minified.code;
  });

  // Minify HTML output
  eleventyConfig.addTransform("htmlmin", function(content, outputPath) {
    if (outputPath.indexOf(".html") > -1) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      });
      return minified;
    }
    return content;
  });

  // Don't process folders with static assets
  eleventyConfig.addPassthroughCopy("favicon.ico");
  eleventyConfig.addPassthroughCopy("static/img");
  eleventyConfig.addPassthroughCopy("admin/");
  eleventyConfig.addPassthroughCopy("_includes/assets/css/inline.css");

  /* Markdown Plugins */
  let markdownIt = require("markdown-it");
  let markdownItAnchor = require("markdown-it-anchor");
  let options = {
    breaks: true,
    linkify: true
  };
  let opts = {
    permalink: false
  };

  eleventyConfig.setLibrary("md", markdownIt(options)
    .use(markdownItAnchor, opts)
  );

  // Add Related Posts Collection
  eleventyConfig.addCollection("relatedPosts", function (collectionApi) {
    let posts = collectionApi.getAll(); // Get all posts

    posts.forEach(post => {
      post.data.related = posts
        .filter(otherPost =>
          otherPost.url !== post.url && // Exclude itself
          post.data.tags &&
          otherPost.data.tags &&
          hasCommonTagsExcludingPost(post.data.tags, otherPost.data.tags) // Check common tags
        )
        .slice(0, 3); // Limit to 3 related posts
    });

    return posts;
  });

  // Helper function to check for common tags excluding "post"
  function hasCommonTagsExcludingPost(tags1, tags2) {
    let filteredTags1 = tags1.filter(tag => tag !== "post");
    let filteredTags2 = tags2.filter(tag => tag !== "post");

    return filteredTags1.some(tag => filteredTags2.includes(tag));
  }



  return {
    templateFormats: ["md", "njk", "liquid"],
    pathPrefix: "/",
    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };
};
