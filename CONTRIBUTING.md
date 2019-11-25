[slack]: https://aframe.io/slack-invite/
[stackoverflow]: http://stackoverflow.com/questions/tagged/aframe

Interested in contributing? As an open source project, we'd appreciate any help
and contributions! On top of the A-Frame framework itself, you can also
contribute to these related projects:

- [aframe-inspector](https://github.com/aframevr/aframe-inspector)
- [aframe-site](https://github.com/aframevr/aframe-site)

# Join the Community on Slack

1. [Invite yourself][slack] to the A-Frame Slack channel.
2. [Join the discussion](https://aframevr.slack.com)!

# Get Help or Ask a Question

If you're not sure how to do something with A-Frame, please post a question
(and any code you've tried so far) to [Stack Overflow under the 'aframe'
tag][stackoverflow]. Questions there will automatically create notifications in
[Slack][slack], and are easier for others to find so new developers can learn
from your questions too.

# File an Issue

1. Search the [issue tracker](https://github.com/aframevr/aframe/issues) for similar issues.
2. Specify the version of A-Frame in which the bug occurred.
3. Specify information about your browser and system (e.g., "Firefox Nightly on OS X")
4. Describe the problem in detail (i.e., what happened and what you expected would happen).
5. If possible, provide a small test case with [CodePen](http://codepen.io), a link to your application, and/or a screenshot. You can fork this [sample pen](http://codepen.io/anon/pen/KVWpbb).

# Contribute Code to A-Frame

[aframe]: https://github.com/aframevr/aframe/
[easy]: https://github.com/aframevr/aframe/labels/help%20wanted%20%28easy%29
[hard]: https://github.com/aframevr/aframe/labels/help%20wanted%20%28hard%29
[pr]: https://www.digitalocean.com/community/tutorials/how-to-create-a-pull-request-on-github
[ssh]: https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/
[testing-guide]: https://github.com/aframevr/aframe/tree/master/tests#a-frame-unit-tests

Check out the [issues labeled *help wanted (easy)*][easy] or [*help wanted
(hard)*][hard] for good issues to tackle. Here's how to submit a pull request (PR):

1. Have a [GitHub account](https://github.com/join) with [SSH keys][ssh] set up.
2. [Fork](https://github.com/aframevr/aframe/fork) the repository on GitHub.
3. Clone your fork of the repository locally (i.e., `git clone git@github.com:yourusername/aframe`).
4. Run `npm install` to get dependencies and `npm start` to serve the test examples.
5. Create a branch to work in (i.e., `git checkout -b mybranch`).
6. Make changes to your fork of the repository, commit them, and push them (i.e., `git add -A . && git commit -m 'My Changes (fixes #1234)' && git push origin mybranch`).
7. If necessary, write [unit tests](tests/) ([guide][testing-guide]) and run with `npm test`.
8. [Submit a pull request][pr] to the master branch. If you head to the [A-Frame repository][aframe] after running `git push` from earlier, you should see a pop up to submit a pull request.
9. [Address review comments](http://stackoverflow.com/questions/9790448/how-to-update-a-pull-request) if any.

As per usual with open source, you would agree to license your contributions
under the [MIT License](LICENSE).

# Share your Work

1. Create something awesome like a scene, a component, or a shader.
2. Publish your work to Github (and GitHub pages) so everyone can learn from your work.
3. Share it on [Slack][slack] or Twitter.
4. Let us know about it so we can feature it on our blog: [A Week of A-Frame](https://aframe.io/blog/).
4. For bonus points, write and publish a case study to explain how you built it.

# Update Documentation

If you catch a typo or error in the documentation, we'd greatly appreciate a
pull request.

1. Go to the bottom of the documentation page on `aframe.io` you wish to update.
2. Click *Edit Page* GitHub button.
3. Edit the documentation through GitHub's text editor.
4. Prepend the commit message with `[docs]`.
5. We will merge the pull request and cherry-pick it onto documentation
branches for older versions if necessary.

You can also do `npm run docs` within the A-Frame project to start a local live
server for watching and serving documentation.

## Add Glitch Examples to Documentation

We like to have simple and interesting [Glitch](https://glitch.com/~aframe)
examples listed on relevant documentation pages. Glitch lets people remix/fork
examples and code right in the browser with live updates. If you have a Glitch
that might be useful in the documentation, request to add it!

1. Have a Glitch example ready. [Remix the base A-Frame Glitch](https://glitch.com/~aframe) to maintain consistency and formatting. Follow [best practices](https://aframe.io/docs/master/introduction/best-practices.html).
2. Go to the bottom of the documentation page on `aframe.io` you wish to update.
3. Click *Edit Page* GitHub button.
4. Add Glitch examples to the `examples` piece in the header, with `title` and `src`. [See example](https://github.com/aframevr/aframe/commit/1472ab23b957e6345c7fc242242f505927463122).

If a Glitch example needs to be updated for whatever reason, we can remix the
Glitch and update the `src` URL.

# Help Your Fellow A-Framers

## On Slack

1. [Invite yourself][slack] to the A-Frame Slack channel.
2. Help answer questions that people might have and welcome new people.
3. Redirect or cross-post questions to the [Stack Overflow A-Frame tag][stackoverflow].

## On GitHub

1. Help respond to [newly-filed GitHub issues](https://github.com/aframevr/aframe/issues)
2. Redirect developers to [Stack Overflow][stackoverflow] if a question is filed rather than an issue.
3. For extra points, cross-post and answer the question on Stack Overflow after redirecting!

# Curate and Make Efforts Known

Every week, we round up all the cool stuff happening with A-Frame on the
[blog](https://aframe.io/blog). We collect things to show off in [these GitHub
issues](https://github.com/aframevr/aframe-site/labels/A%20Week%20of%20A-Frame).
If you see anything, just post it there!


# Spread the Word

If you want to hold an event and talk about WebVR and A-Frame, check out [the
presentation kit](https://github.com/aframevr/aframe-presentation-kit).

Thanks so much for contributing and helping grow WebVR!
