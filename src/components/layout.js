/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
  *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import PropTypes from "prop-types"
import { useStaticQuery, graphql } from "gatsby"

import Header from "./header"
import "./layout.css"

const Layout = ({ children }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  return (
    <div style={{

    }}>
      <Header siteTitle={data.site.siteMetadata.title} />
      <div
        style={{
          margin: `0 auto`,
          maxWidth: 960,
          padding: '1.5em',
          paddingTop: '30vh',
        }}
      >
        <main>{children}</main>
        <footer style={{ position: 'absolute', bottom: 0, marginBottom: '1em'}}>
          {`© ${new Date().getFullYear()}, Made with ❤️ by Benjamin Poon.`}
        </footer>
      </div>
    </div>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
