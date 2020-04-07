import React from "react"
import Layout from "../components/layout"
import SEO from "../components/seo"

import { FaTwitter, FaGithubAlt } from "react-icons/fa"
import "./index.css"

const SocialButton = ({ url, text, iconComponent, children }) => (
  <li
    className="SocialButton"
    style={{
      padding: ".5em",
      marginRight: "0.5em",
      borderWidth: 1,
      borderColor: "black",
      borderStyle: "solid",
      borderRadius: 5,
    }}
  >
    <a style={{ textDecoration: "none" }} href={url}>
      <div className="innerWrapper">
        {children}
      </div>
    </a>
  </li>
)

const IndexPage = () => (
  <Layout>
    <SEO title="Benjamin Poon's Portfolio" />
    <h1 style={{ marginTop: "15vh" }}>Hello Beautiful People 👋</h1>
    <h1>I'm working on this page right now</h1>
    <div style={{ marginTop: "2em" }}>
      <img src="https://i.giphy.com/media/6dZSMuwIZTIju/source.gif"/>
      <h3>Come back reeeeal soon, k?</h3>
      <ul
        style={{
          margin: 0,
          padding: 0,
          listStyleType: "none",
          display: "flex",
        }}
      >
        <SocialButton url="https://twitter.com/mostly_error">
          {"Twitter"}
          <FaTwitter />
        </SocialButton>
        <SocialButton url="https://github.com/mostlyerror">
          {"Github"}
          <FaGithubAlt />
        </SocialButton>
      </ul>
    </div>
  </Layout>
)

export default IndexPage
