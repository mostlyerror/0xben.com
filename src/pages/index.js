import React from "react"
import Layout from "../components/layout"
import SEO from "../components/seo"

import Header from '../components/Header'

// import { FaTwitter, FaGithubAlt } from "react-icons/fa"
import "./index.css"

const IndexPage = () => (
  <Layout>
    <SEO title="Benjamin Poon's Portfolio" />
    <h1>This is an h1</h1>
    <h2>This is an h2</h2>
    <p>This is a paragraph</p>
  </Layout>
)

export default IndexPage
