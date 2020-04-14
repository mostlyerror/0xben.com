import React from "react"
import Layout from "../components/Layout"
import SEO from "../components/Seo"
import Header from '../components/Header'
import Projects from '../components/Projects'
import Skills from '../components/Skills'

import "./index.css"

const IndexPage = () => (
  <Layout>
    <SEO title="Benjamin Poon's Portfolio" />
    <div className="left-container">
      <Header />
    </div>
    <div className="right-container">
      <Projects />
      <Skills />
    </div>
  </Layout>
)

export default IndexPage
