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
    <div style={{}}>
      <Header siteTitle={data.site.siteMetadata.title} />
      <div
        style={{
          margin: `0 auto`,
          maxWidth: 960,
          padding: "1.5em",
        }}
      >
        <main>{children}</main>
        <footer
          style={{
            width: '100%',
            display: "flex",
            justifyContent: 'center',
            marginBottom: ".5em",
            marginTop: '10vh',
          }}
        >
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
