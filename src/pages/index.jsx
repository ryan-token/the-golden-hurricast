import React from 'react'
import Button from 'react-bootstrap/Button'
import { graphql, Link } from 'gatsby'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import NavigationBar from '../components/NavigationBar'
import HomeJumbotron from '../components/HomeJumbotron'
import Seo from '../components/seo'
import Socials from '../components/Socials'

import 'bootstrap/dist/css/bootstrap.min.css'

// Screen-reader-only: present for assistive tech (and the rel="me" crawler) but visually hidden.
const visuallyHidden = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
}

const HomeLayout = ({data}) => {
  const { edges } = data.allMarkdownRemark
  const latestPost = edges[0]
  const { frontmatter } = latestPost.node
  
  return (
    <div>
      <NavigationBar />
      <HomeJumbotron />
      <div
        style={{
          marginTop: '30px',
          marginLeft: '30px',
          marginRight: '30px',
          marginBottom: '30px',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >

        <Container>
          <Row>
            <Col md={6}>
              <Row>
                <h4>Podcast</h4>
              </Row>
              <hr />
              <Row>
                <p>
                  The Golden Hurricast is a weekly podcast covering Golden
                  Hurricane athletics at The University of Tulsa.
                </p>
              </Row>
              <Row>
                <p>
                  <Button variant='outline-primary' href='/podcast'>
                    Listen to our podcast
                  </Button>
                </p>
              </Row>
              <Row>
                <iframe title='Apple Podcasts Embed' src='https://embed.podcasts.apple.com/us/podcast/the-golden-hurricast/id1435008302?itsct=podcast_box_player&amp;itscg=30200&amp;ls=1&amp;theme=light' height='450px' frameBorder='0' sandbox='allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation' allow='autoplay *; encrypted-media *; clipboard-write' style={{display: 'flex', marginLeft: 'auto', marginRight: 'auto', width: '100%', maxWidth: '660px', overflow: 'hidden', borderRadius: '10px', backgroundColor: 'transparent'}}></iframe>
              </Row>
              <br /> <br />
              <Row>
                <h4>Blog</h4>
              </Row>
              <hr />
              <Row>
                <p>
                  We've discontinued this blog. We're writing much more often over on our <a href="https://patreon.com/thegoldenhurricast" rel='noopener noreferrer' target='_blank'>Patreon</a> now. Check it out!
                </p>
              </Row>
              
              <Row>
                <h6 style={{marginBottom: '1rem'}}>Latest blog post:</h6>
              </Row>
              <Row>
                <div key={Math.random()} className='pull-left'>
                  <Container style={{padding: '0px'}}>
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
              </Row>
              
              <br />
              
              <Row>
                <p>
                  <Button variant='outline-primary' href='/blog'>
                    See all posts
                  </Button>
                </p>
              </Row>
              
              <br /> <br />
            </Col>
            
            <Col md={{ span: 5, offset: 1 }}>
              <Row>
                <h4>Patreon</h4>
              </Row>
              <hr />
              <Row>
                <p>
                  Unlock access to our newsletter, advanced stat breakdowns, a private Discord, automatic NIL contributions, and more.
                </p>
              </Row>
              <Row>
                <p>
                  <Button variant='outline-dark' href='https://patreon.com/thegoldenhurricast'>
                    Join our Patreon
                  </Button>
                </p>
              </Row>
              
              <Row>
                <picture>
                  <a href="https://patreon.com/thegoldenhurricast">
                    <img 
                      src="/patreon.png" 
                      alt="Patreon membership tiers screenshot" 
                      className="img-fluid w-100 rounded"
                      style={{ maxWidth: '100%' }}
                    />
                  </a>
                </picture>
              </Row>
              
              <br /> <br />
            
              <Row>
                <h4>Socials</h4>
              </Row>
              <hr />
              <Socials />
            </Col>
          </Row>
        </Container>
      </div>
      <script
        id='dsq-count-scr'
        src='//thegoldenhurricast.disqus.com/count.js'
        async
      ></script>
      
      {/* IndieWeb / Mastodon rel="me" identity verification link (visually hidden) */}
      <a rel='me' href='https://indieweb.social/@ryantoken'>
        <span style={visuallyHidden}>The Golden Hurricast on Mastodon</span>
      </a>
    </div>
  )
}

export const query = graphql`
   query LatestBlogQuery {
     allMarkdownRemark(sort: { frontmatter: { sortDate: DESC } }, limit: 1) {
       edges {
         node {
           id
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

export default HomeLayout

export const Head = () => {
  return (
    <>
      <Seo
        title={'The Golden Hurricast'}
        description={'The leading independent podcast and blog covering Golden Hurricane athletics at The University of Tulsa'}
        image={'/logo-white.jpg'}
      />
      <meta charSet='utf-8' />
      <title>The Golden Hurricast</title> 
    </>
  )
}