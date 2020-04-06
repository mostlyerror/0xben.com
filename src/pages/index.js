import React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import Image from "../components/image"
import SEO from "../components/seo"

const Video = ({ videoSrcURL, videoTitle, ...props }) => (
  <div className="video">
    <iframe
      style={{ width: '100%'}}
      src={videoSrcURL}
      title={videoTitle}
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      frameBorder="0"
      webkitallowfullscreen="true"
      mozallowfullscreen="true"
      allowFullScreen
    />
  </div>
)


const IndexPage = () => (
  <Layout>
    <SEO title="Benjamin Poon's Portfolio" />
    <h1>Hi beautiful people 👋</h1>
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
    </div>
  </Layout>
)

export default IndexPage
