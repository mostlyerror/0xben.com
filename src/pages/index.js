import React from "react"
import Layout from "../components/layout"
import SEO from "../components/seo"

// import { FaTwitter, FaGithubAlt } from "react-icons/fa"
import "./index.css"

const IndexPage = () => (
  <Layout>
    <SEO title="Benjamin Poon's Portfolio" />
    <header
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <h1 style={{color: '#fff', fontSize: 48, lineHeight: 1.25,fontWeight: 700 }}>Hello, I'm Ben Poon.</h1>
      </div>
      <div style={{display: 'flex', alignItems: 'center', marginTop: 32 }}>
        I'm a blah blah
      </div>

    </header>
  </Layout>
)

export default IndexPage
