import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'

const DEFAULT_IMAGE = '/MattRyanPat.jpeg'

const Seo = ({ title, description, image, pathname, article = false }) => {
  const { site } = useStaticQuery(query)

  const {
    defaultTitle,
    defaultDescription,
    siteUrl,
    twitterUsername,
  } = site.siteMetadata

  const seo = {
    title: title || defaultTitle,
    description: description || defaultDescription,
    image: `${siteUrl}${image || DEFAULT_IMAGE}`,
    url: pathname ? `${siteUrl}${pathname}` : null,
  }

  return (
    <>
      <meta name='description' content={seo.description} />
      <meta name='image' content={seo.image} />

      {seo.url && <meta property='og:url' content={seo.url} />}

      {article && <meta property='og:type' content='article' />}

      {seo.title && <meta property='og:title' content={seo.title} />}

      {seo.description && (
        <meta property='og:description' content={seo.description} />
      )}

      {seo.image && <meta property='og:image' content={seo.image} />}

      <meta name='twitter:card' content='summary' />

      {twitterUsername && (
        <meta name='twitter:creator' content={twitterUsername} />
      )}

      {seo.title && <meta name='twitter:title' content={seo.title} />}

      {seo.description && (
        <meta name='twitter:description' content={seo.description} />
      )}

      {seo.image && <meta name='twitter:image' content={seo.image} />}
    </>
  )
}

export default Seo

const query = graphql`
  query Seo {
    site {
      siteMetadata {
        defaultTitle: title
        defaultDescription: description
        siteUrl
        twitterUsername
      }
    }
  }
`
