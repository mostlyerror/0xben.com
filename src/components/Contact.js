import React, { useState } from "react"

import "./Contact.css"

const Contact = props => {
  const [submitted, setSubmitted] = useState(false)
  const handleSubmit = ev => {
    ev.preventDefault()
    setSubmitted(true)
  }

  return (
    <div id="contact">
      <h3>Drop me a line...</h3>
      {submitted ? (
        <div className="form-submitted">
          <h2>Woohoo!</h2>
          <p>I'll get back to you as soon as I can.</p>
        </div>
      ) : (
        <form
          name="contact"
          method="post"
          data-netlify="true"
          data-netlify-honeypot="bot-field"
          onSubmit={handleSubmit}
        >
          <input type="hidden" name="form-name" value="contact" />

          <label>Email:</label>
          <input type="email" name="name" />
          <label>Message:</label>
          <input type="text" name="message" />
          <button>Send</button>
        </form>
      )}
    </div>
  )
}

export default Contact
