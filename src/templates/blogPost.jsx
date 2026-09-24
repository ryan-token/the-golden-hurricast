import React from 'react'
import { graphql, Link } from 'gatsby'
import { DiscussionEmbed } from 'disqus-react'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import NavigationBar from '../components/NavigationBar'
import Seo from '../components/seo'

const Template = ({data, pageContext}) => {
    const { next, prev } = pageContext

    const { markdownRemark } = data
    const title = markdownRemark.frontmatter.title
    const authors = markdownRemark.frontmatter.authors
    const date = markdownRemark.frontmatter.date
    const html = markdownRemark.html

    const disqusConfig = {
      shortname: 'thegoldenhurricast',
      config: { identifier: title },
    }

    return (
      <div>
        <NavigationBar />
        
        <div id='blogAlignment'>

          <div
            className='blogpost'
            style={{
              marginTop: '55px',
            }}
          >
            <h2 style={{ fontSize: '40px', fontWeight: 'bold' }}>{title}</h2>
            <p style={{ fontSize: '16px', color: 'grey' }}>
              By: {authors}
              <br />
              Date: {date}{' '}
            </p>
          </div>

          <br />

          <div
            className='blogpost'
            style={{
              marginBottom: '60px',
              fontSize: '18px',
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />

          <div style={{padding: '15px', marginBottom: '25px'}}>
            <DiscussionEmbed {...disqusConfig} />
          </div>

          {/*footer*/}
          <div>
            <Navbar fixed='bottom' expand='lg' bg='light' variant='light'>
              <Nav className='me-auto' style={{paddingLeft: '10px'}}>
                {prev && <Link to={prev.frontmatter.path}>Previous</Link>}
              </Nav>
              <Nav className='ms-auto' style={{paddingRight: '10px'}}>
                {next && <Link to={next.frontmatter.path}>Next</Link>}
              </Nav>
            </Navbar>
          </div>
        </div>
      </div>
    )
}

export const query = graphql `
    query($pathSlug: String!) {
        markdownRemark(frontmatter: { path: {eq: $pathSlug} }) {
            html
            frontmatter {
                title
                excerpt
                authors
                date
            }
        }
    }
`

export default Template

export const Head = ({ data, location }) => {
  const { title, excerpt } = data.markdownRemark.frontmatter
  return (
    <>
      <Seo
        title={title}
        description={excerpt}
        image={'/logo-white.jpg'}
        pathname={location.pathname}
        article
      />
      <meta charSet='utf-8' />
      <title>{title}</title>
    </>
  )
}