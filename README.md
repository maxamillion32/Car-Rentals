# Car-Rentals
Single Page App using Backbone and Hotwire's Car Rental API

# Description
The Car Rental App is a small demo application that performs queries to Hotwire's Car Rental API, displays available car rentals, provides rudimentary search filters, and additional details about each car rental.

# Demo
[Demo Link](http://ec2-54-172-17-79.compute-1.amazonaws.com/)

# DesktopInit
Since Backbone is an Event-Driven framework, a pubSub object was added to the Backbone object to facilitate communication between views.

# Router
Only the Desktop Router is implemented for this demo. The router is strictly speaking responsible for maintaining synchronicity between the window.href.location and the view currently being displayed. Since this is a small demo, some application logic has been placed inside 

# Models/Collections
- **Car:** The model used for each car rental object recieved from Hotwire's Car Rental API
- **CarCollection:** The collection used to contain all car instances. The CarCollection's fetch() method is overridden to query the a Hotwire URL. The parse() method is overriden to process the data received by extending each raw car object with car type meta data and attaching additional properities to enable filtering.

# Views
**Top-Level Views** - responsible for making changes to data models, re/rendering subviews, and destroying subviews in response to events received from component views.
**Component Views** - responsible for triggering events in response to user interaction, displaying information, and managing own internal state.

  ## Defined Views
  -Home
  -CarListView
  -CarDetailView
  -HeaderView
  -SearchView
  -FilterView
  -LoadingScreenView

Views are rendered using [Handlebars](http://handlebarsjs.com/)

# Libraries
- [Backbone-Require-Boilerplate](https://github.com/BoilerplateMVC/Backbone-Require-Boilerplate) was used as a seed project to handle boilerplate code and workflow configuration
- [jQueryUI Datetimepicker Plugin](http://xdsoft.net/jqplugins/datetimepicker/) was used for all Datetimepickers

# Limitations
- Mobile Implementation: Demo is configured to only work for desktop. A future improvement would be to implement  the Mobile Router and Mobile CSS with @media-queriers to provide a mobile-optimized experience
- Cleaner Abstractions: The Router contains logic that is strictly not the responsibility of the router view, e.g. composing and redirecting to a default search query.  In a larger app, this kind of logic should properly be abstracted away into a higher level 'Application' abstraction. Logic placed in CarCollection (parsing function especially, which processes data recieved from the Hotwire API) could benefit from indirection, with data processing moved to a separate utility and parsing done at the model-level.
- The Hotwire API is not RESTful, so extensive overriding was required for CarCollection fetching/parsing. Querying on car/:id is not provided by the API, and therefore, implementation of CarDetailView is not ideal. A tradeoff was made redirecting the user to a default search query when visting a CarDetailView Url directly (#/cars/:resultId) vs caching queries to allow CarDetailViews to be revisited directly, due to complexity.
- Unit Tests: Demo could be greatly improved by writing unit test coverage for every component (Karma and Jasmine are bundled into the seed project)

