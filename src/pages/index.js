import React from "react"
import Layout from "../components/layout"
import SEO from "../components/seo"

import { FaTwitter, FaGithubAlt } from "react-icons/fa"

const Video = ({ videoSrcURL, videoTitle, ...props }) => (
  <div className="video">
    <iframe
      style={{ 
        width: "100%",
        height: '100%',
        minWidth: '100%',
        minHeight: '50vw',
      }}
      src={videoSrcURL}
      title={videoTitle}
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      frameBorder="0"
      webkitallowfullscreen="true"
      mozallowfullscreen="true"
      allowFullScreen
      width="100%"
    />
  </div>
)

const SocialButton = ({ url, text, iconComponent, children }) => (
  <li
    style={{
      padding: ".5em",
      borderWidth: 1,
      borderColor: "black",
      borderStyle: "solid",
      borderRadius: 5,
      marginRight: '0.5em',
    }}
  >
    <a style={{textDecoration: 'none',}} href={url}>
      {text} {iconComponent}
    </a>
  </li>
)

const IndexPage = () => (
  <Layout>
    <SEO title="Benjamin Poon's Portfolio" />
    <h1 style={{marginTop: '15vh'}}>Hi beautiful people 👋</h1>
    <h1>I'm working on this right now</h1>
    <div style={{ marginTop: "3em" }}>
      <div
        style={{
          width: "100%",
          position: "relative",
        }}
      >
        <Video
          videoSrcURL="https://giphy.com/gifs/f978c5EFp3Vu0/html5"
          videoTitle="Kermit Typing"
        />
      </div>
      <h3>Come back real soon, k?</h3>
      <ul style={{ margin: 0, padding: 0, listStyleType: "none", display: "flex" }}>
        <SocialButton
          url="https://twitter.com/mostly_error"
          text="DMS. Slide."
          iconComponent={<FaTwitter />}
        />
        <SocialButton
          url="https://github.com/mostlyerror"
          text="GittyUp"
          iconComponent={<FaGithubAlt />}
        />
      </ul>
    </div>
  </Layout>
)

export default IndexPage
