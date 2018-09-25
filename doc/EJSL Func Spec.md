# Essential JavaScript Links Func Spec 

## Disclaimer

This document is a work in progress, so don't expect it to be complete yet. Feel free to ask away.

Also note that there is no separate technical specification, at least for now. So all the technical decisions are put here. This might change if the volume of this spec--or the dev team--grows significantly.

## Features

### Links Metadata:
  - Title
  - Href
  - Author (optional)
  - Screenshot url
  - Short description
  - Long description (optional, defaults to short description)
  - Rank (invisible for viewers)
  - Categories (there may be more than one. links are grouped by them, but not in filtered views)
  - Level (labelled as "Good for:". Values are: "Beginners", "Intermediate" and "Advanced")
  - Tags (a list)
  
**Technicality**: Here's an example of a link record with full metadata (well, short of that screenshot image url):
```JavaScript
    {
      "title": "The Dream Machine: J.C.R. Licklider and the Revolution That Made Computing Personal",
      "href": "http://www.amazon.com/gp/product/0670899763?ie=UTF8&camp=213733&creative=393177&creativeASIN=0670899763&linkCode=shr&tag=ericleads-20&linkId=NDUXYQOCMPC47SQI",
      "author": "M. Mitchell Waldrop",
      "short_description": "A man that made computing personal (not Jobs).",
      "long_description": "In 1962, decades before \"personal computers\" and \"Internet\" became household words, the revolution that gave rise to both of them was set in motion from a small, nondescript office in the depths of the Pentagon.",
      "rank": 1,
      "categories": [
        "Books"
      ],
      "level": "Beginners",
      "tags": [
        "history",
        "biography",
        "revolution"
      ]
    }
```
  
### Links sorting and filtering 

#### Rank for sorting order
Every link has a rank property that is used as a default sort order, from the highest rank to the lower. A rank is an abstract value invisible to viewers. It might mean a preferred order of learning for some categories (like _Books_) or popularity and importance for some other (like _Libraries_).
 
When grouping links by category, we sort inside a category, when showing filtered links, we sort among the filtering/search results.

**Technicality**: Rank ranges from 0 to 10. Links missing a `rank` property are considered the lowest rank and are shown last.

#### Searching and filtering
You can search:
* by title
* by title and description
* by tags

You can filter:
* by difficulty
* by suggested/curated
* by platform (frontend/backend/desktop etc.)
* by rating (for suggested links)

(There's basically no borderline between searching and filtering. We can have both at once _and_ we might present it in one panel.)

## Presentation
### Displaying links by category

This is what you get by default: a bunch of links listed by _Category_. Every category has its name as a header and a list of links as its body.

**Technicality**: The order of categories is defined by the `linkCategories` array (so far taken from `/src/data/the-big-data.json`).

You can expand and collapse individual categories (group of links). When all the categories are collapsed, you just scroll through a list of categories. A useful thing to do on mobile.
(On bigger screens you might want to use a pull down list of categories to the same effect.)

On mobile or tablet, when a categoryful of links is expanded, its header sticks to the top of the viewport until we reach the end of the list and move on to the next list.

### Displaying the filtering/search/tag results

If there's a search/filter applied, we don't group links by category. Then we display category (or categories, if a link belongs to a few) in every link's metadata.

### The links themselves
Links have compact and expanded view.

#### Compact view

In compact view, links behave like list items. You scroll lists of compact links. A compact link consist of:

* Title (with active a href)
* Author (optional)
* Short description
* List of tags
* Level (who ist good for: beginners | intermediate | advanced)

When a list (of contracted links) is expanded and you scroll down past it, the next list automatically expands and the list above collapses. That way you can scroll through all the links in the collection.

#### Expanded view

Expanded links (with added screenshot and a full description instead of a short one) basically behave like cards.

On mobile you view cards one at a time and scroll through them horizontally. A vertical scroll moves you to the next category.

On tablets and above we show a few cards across and scroll through them vertically. (Maybe allow for horizontal scroll too: a whole row moves left, another moves in from the right, the row below, if it's visible, also shifts one row to the left etc.)

_(What's the exact moment when we decide the list is over? When the next header reaches the middle of the viewport? Earlier? Later? What about when we scroll up?)_

There's a _Submit a link_ link at the end of every list. And it sets the _Category_ property in the _Submit a link_ form to the category in which we .

There's a tab-like set of links above all the lists: "Show: curated | submitted | both". It doesn't  stay as we scroll down and its functionality is doubled in the Search/filter panel.

### The Search/Filtering panel

There is one panel, with textual search and filters.

_(We could have two, where the search panel would include all the filters, but then what happens when we reset the search? Should the filters also be reset? Besides, is filtering by tags a filter or a search? Or do we treat tags separately?)_

It has:
* A text input for _Search_ or _Contains_
* A tick for _Title only_
* A smart input for _Tags_ (with hints)
* A drop down list for _Difficulty level_
* Ditto for _Suggested/curated/both_
* A list box (with multiple selection) for _Platform_
* A _Show the links_ button
* A _Reset filters_ button

