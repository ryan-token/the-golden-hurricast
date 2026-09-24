const path = require('path')
const { createFilePath } = require('gatsby-source-filesystem')

const createTagPages = (createPage, posts) => {
    const allTagsIndexTemplate = path.resolve('src/templates/allTagsIndex.jsx')
    const singleTagIndexTemplate = path.resolve('src/templates/singleTagIndex.jsx')

    const postsByTag = {}

    posts.forEach(({node}) => {
        if (node.frontmatter.tags) {
            node.frontmatter.tags.forEach(tag => {
                if (!postsByTag[tag]){
                    postsByTag[tag] = []
                }

                postsByTag[tag].push(node)
            })
        }
    })

    const tags = Object.keys(postsByTag)

    createPage({
        path: '/tags',
        component: allTagsIndexTemplate,
        context: {
            tags: tags.sort()
        }
    })

    tags.forEach(tagName => {
        const posts = postsByTag[tagName]

        createPage({
            path: `/tags/${tagName}`,
            component: singleTagIndexTemplate,
            context: {
                posts,
                tagName
            }
        })
    })
}

exports.createPages = async ({ graphql, actions, reporter }) => {
    const { createPage } = actions
    const blogPostTemplate = path.resolve('src/templates/blogPost.jsx')

    const result = await graphql(`
        query {
            allMarkdownRemark(
                sort: { frontmatter: { sortDate: ASC } }
            ) {
                edges {
                    node {
                        frontmatter {
                            path
                            title
                            tags
                            sortDate
                        }
                    }
                }
            }
        }
    `)

    if (result.errors) {
        reporter.panicOnBuild('Error loading markdown posts', result.errors)
        return
    }

    const posts = result.data.allMarkdownRemark.edges

    createTagPages(createPage, posts)

    posts.forEach(({ node }, index) => {
        const postPath = node.frontmatter.path
        createPage({
            path: postPath,
            component: blogPostTemplate,
            context: {
                pathSlug: postPath,
                prev: index === 0 ? null : posts[index - 1].node,
                next: index === (posts.length - 1) ? null : posts[index + 1].node
            }
        })
    })
}

exports.onCreateWebpackConfig = ({ actions }) => {
    // webpack's persistent cache logs a "Serializing big strings" hint for large vendor files
    // (React's builds, Bootstrap's CSS). It isn't actionable, so keep only real problems.
    // This only affects webpack's infrastructure logger; compilation warnings/errors still show.
    actions.setWebpackConfig({
        infrastructureLogging: { level: 'error' },
    })
}
