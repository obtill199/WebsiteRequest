# Website request form

A four-step, mostly multiple-choice questionnaire for prospective website clients. Open `index.html` to preview it. No build tools or account are needed to edit the site.

## What it collects

1. Business name, location, category, and either a link to an existing page or a short description.
2. Main website goal, desired sections, and primary button.
3. Visual style, colors, available photos/logo, and an optional inspiration link.
4. Name, email, optional phone, timeline, and optional notes.

The last step shows a summary. On submit, the page sends all answers to the site owner's inbox through [FormSubmit](https://formsubmit.co/documentation). The client's email is sent in the `email` field so replies can go directly to them. If delivery fails, the answers remain on the page so the client can retry.

## Before sending the link to clients

1. Publish this folder to GitHub Pages. A local `file://` address only works on this computer for previews; FormSubmit requires a web server for submissions.
2. Fill out the published form once with test details and check that the answers arrive in the inbox. Check spam if needed.
3. Send the published link to clients. Paste a request email here when you want me to make their first draft.

FormSubmit has been activated for the destination inbox. Email delivery should be verified with a live request from the published site before sharing the link. The form's success and failure screens were tested with simulated responses; they do not prove delivery to Gmail.

## Change the destination

If the destination changes, the new inbox must confirm its own FormSubmit activation email. Replace the token in the form action and AJAX URL with the new token. Keep personal addresses out of public source files.

## Files

- `index.html`: questions and page content.
- `styles.css`: responsive design.
- `script.js`: step navigation, validation, summary, and submission.
- `assets/favicon.svg`: site icon.
- `evidence/`: inspected desktop and mobile previews.
