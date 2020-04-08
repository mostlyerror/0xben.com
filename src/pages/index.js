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
      <div style={{ display: "flex", flexDirection: "column" }}>
        <h1
          style={{
            color: "#fff",
            fontSize: 48,
            lineHeight: 1.25,
            fontWeight: 700,
          }}
        >
          Hello, I'm Ben Poon.
        </h1>
        <p style={{
          color: '#949495',
          marginTop: 32,
          lineHeight: 2,
          fontSize: 14,
          fontWeight: 300,
        }}>
          I'm a full stack engineer currently working at a SaaS healthcare startup.

        </p>
          
      </div>
      <div style={{ display: "flex", alignItems: "center", marginTop: 32 }}>
      </div>
    </header>
  </Layout>
)

export default IndexPage
