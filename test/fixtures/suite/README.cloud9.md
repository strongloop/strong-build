# Welcome to the StrongLoop Cloud Experience!

This Cloud 9 Workspace contains several StrongLoop products including slc (CLI),
LoopBack (API Server) and the StrongOps agent (DevOps and Performance Monitoring) 
for you to try in the cloud (Cloud 9, to be exact) before [downloading and
installing](http://www.strongloop.com/get-started) them on your own.

## Before You Begin

Before we really get into the StrongLoop Suite, take a minute to familiarize
yourself with the Cloud 9 IDE.

 * The left edge of the screen is a full view of the projects, with all the
wonderful files and folders therein. Feel free to have a look around, but we
recommend finishing this README before exploring _too_ much.
 * On the top of the screen is the main menu, the toolbar, and the tabs. Boring,
but necessary. The most necessary element is the "Run" button, which we'll come
to shortly.
 * At the bottom is a two-tab interface: Terminal and Output. The Terminal
allows you to (as you might expect) run commands and interact with your current
application/project. The Output tab contains the logs for the running instance
of your application.
 * When you run the application it'll be necessary to open multiple
 terminal windows to run multiple processes at the same time, to open
 a new terminal window go to the "View" menu and choose
 "Terminals"->New Terminal
 * The panel you're currently reading from is the main code editor; as we walk
through Node examples, this panel will host all of the code being discussed.
 * The panel on the right is a full, working browser window. No browser? Let's
fix that:

## Running and Viewing the SLS Sample Application

Remember that friendly, green "Run" button in the main menu? Go ahead and give
'er a click. The LoopBack Sample App should begin running, and the bottom Output
tab should become visible. If not, select Output in the bottom pane and take
note of a few things:

```
Your code is running at 'http://strongloop.soandso.cloud9beta.com'.
Important: use 'process.env.PORT' as the port and 'process.env.IP' as the host in your scripts!
Using the memory connector.
To specify another connector:
  DB=oracle node app
```

The first is that the application has run successfully. If that's no the case
(for example, if the word Exception and a big, scary stack trace have been
produced, then something's wrong!), then please [reach out](http://wwww.strongloop.com/strongloop-suite/strongsupport) and we'll
gladly give you a hand.

Second, click the blue link in that first message. If the right browser tab was
hidden, it'll reveal itself ... along with the home page of the SLS Sample.

Third, it's MUCH better if you view the home page of the sample
application in a browser on your local machine.  To do so, click the
detach icon on the browser pane, next to the close icon.  This will
open a new browser tab or window on your local browser with the home
page.

Lastly, note the URL of your sample app in the browser pane.  It's
the same URL that should be displayed in the Output tab after "Your
code is running at...".

## Where do I go from here?

Now that you have the Sample App running, embiggen (and, yes, that's a word) the
browser tab on the right or on your local browser and take a peek. The Next Steps are inside!

