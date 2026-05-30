import React from 'react'
import NavigationBar from '../components/NavigationBar'
import BlogJumbotron from '../components/BlogJumbotron'
import Container from 'react-bootstrap/Container'
import Seo from '../components/seo'
import { graphql, Link } from 'gatsby'

const BlogLayout = ({data}) => {
    const { edges } = data.allMarkdownRemark
    return (
      <div>
        <NavigationBar />
        <BlogJumbotron />

        <div
          style={{
            marginLeft: '30px',
            marginRight: '30px',
            marginBottom: '30px',
          }}
        >

          <div style={{display: 'flex', alignItems: 'center'}}>
            <Container className='blogedge'>
              <h4>All Posts</h4>
              <p style={{ fontWeight:"bold" }}>This blog has been discontinued. We're primarily writing over on our <a href="https://patreon.com/thegoldenhurricast">Patreon</a> now. Check it out!</p>
              <hr style={{width: '100%'}} />
            </Container>
          </div>

          {edges.map(edge => {
            const { frontmatter } = edge.node
            return (
              <div key={Math.random()} style={{display: 'flex', alignItems: 'center'}}>
                <Container className='blogedge'>
                    <Link
                      style={{
                        textDecoration: 'none'
                      }}
                      
                      to={`${frontmatter.path}`}
                    >
                      <div
                        key={frontmatter.path}
                        className='floating_still_blog'
                      >
                        <p className='blog_title'>
                          {frontmatter.title}
                        </p>

                        <p className='blog_bylines'>
                          {frontmatter.date}
                        </p>
                        <p className='blog_bylines'>
                          {frontmatter.excerpt}
                        </p>
                      </div>
                    </Link>
                </Container>
              </div>
            )
          })}
        </div>
      </div>
    )
}

export const query = graphql`
         query BlogQuery {
           allMarkdownRemark(
             sort: { frontmatter: { sortDate: DESC } }
           ) {
             edges {
               node {
                 frontmatter {
                   title
                   path
                   date
                   sortDate
                   excerpt
                 }
               }
             }
           }
         }
       `

export default BlogLayout

export const Head = () => {
  return (
    <>
      <Seo
        title={'The Golden Hurricast – Blog'}
        description={"Hurc's Corner. The Golden Hurriblog. Whatever you want to call it, we'll use this to dive deeper into stats, explore TU history, and more"}
        image={'/logo-white.jpg'}
      />
      <meta charSet='utf-8' />
      <title>TGH | Blog</title>
    </>
  )
}
