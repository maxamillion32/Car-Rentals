# Car-Rentals
Single Page App using Backbone and Hotwire's Car Rental API

# Description
The Car Rental App is a small demo application that performs queries to Hotwire's Car Rental API, displays available car rentals, provides rudimentary search filters, and additional details about each car rental.

# Demo



# Libraries
- [Backbone-Require-Boilerplate](https://github.com/BoilerplateMVC/Backbone-Require-Boilerplate) was used as a seed project to handle boilerplate code and workflow configuration
- [jQueryUI Datetimepicker Plugin](http://xdsoft.net/jqplugins/datetimepicker/) was used for all Datetimepickers

# Limitations
- Mobile Implementation: Demo is configured to only work for desktop. A future improvement would be to implement  the Mobile Router and Mobile CSS with @media-queriers to provide a mobile-optimized experience
- Cleaner Abstractions: The Router contains logic that is strictly not the responsibility of the router view, e.g. composing and redirecting to a default search query.  In a larger app, this kind of logic should properly be abstracted away into a higher level 'Application' abstraction. Logic placed in CarCollection (parsing function especially, which processes data recieved from the Hotwire API) could benefit from indirection, with data processing moved to a separate utility and parsing done at the model-level.
- The Hotwire API is not RESTful, so extensive overriding was required for CarCollection fetching/parsing. Querying on car/:id is not provided by the API, and therefore, implementation of CarDetailView is not ideal. A tradeoff was made redirecting the user to a default search query when visting a CarDetailView Url directly (#/cars/:resultId) vs caching queries to allow CarDetailViews to be revisited directly, due to complexity.
- Unit Tests: Demo could be greatly improved by writing unit test coverage for every component (Karma and Jasmine are bundled into the seed project)

