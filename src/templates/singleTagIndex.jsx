import React from 'react';
import NavigationBar from '../components/NavigationBar';
import { Link } from 'gatsby';

const SingleTagTemplate = ({ pageContext }) => {
    const { posts, tagName } = pageContext
  return (
    <div>
      <NavigationBar />
      <div
        style={{
          marginTop: '130px',
          marginLeft: '30px',
          marginRight: '30px',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <h2>Posts about {`${tagName}`}</h2>
        <br />
        <p>
          These are all of the posts we've ever written that relate to{' '}
          {`${tagName}`}:
        </p>

        <hr />

        <ul>
          {posts.map(post => {
            return (
              <li key={post.frontmatter.path}>
                <Link style={{textDecoration: 'none'}} className='blog_title'
                  to={post.frontmatter.path}
                >
                  {post.frontmatter.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default SingleTagTemplate;
