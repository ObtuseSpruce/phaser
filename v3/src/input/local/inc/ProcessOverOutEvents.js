var InputEvent = require('../events');

var ProcessOverOutEvents = function (pointer)
{
    var currentlyOver = this._temp;

    var i;
    var gameObject;
    var justOut = [];
    var justOver = [];
    var stillOver = [];
    var previouslyOver = this._over[pointer.id];

    if (this.topOnly && currentlyOver.length)
    {
        this.sortGameObjects(currentlyOver);

        //  Only the top-most one counts now, ignore the rest
        currentlyOver.splice(1);
    }

    //  Go through all objects the pointer was previously over, and see if it still is.
    //  Splits the previouslyOver array into two parts: justOut and stillOver

    for (i = 0; i < previouslyOver.length; i++)
    {
        gameObject = previouslyOver[i];

        if (currentlyOver.indexOf(gameObject) === -1)
        {
            //  Not in the currentlyOver array, so must be outside of this object now
            justOut.push(gameObject);
        }
        else
        {
            //  In the currentlyOver array
            stillOver.push(gameObject);
        }
    }

    //  Go through all objects the pointer is currently over (the hit test results)
    //  and if not in the previouslyOver array we know it's a new entry, so add to justOver
    for (i = 0; i < currentlyOver.length; i++)
    {
        gameObject = currentlyOver[i];

        //  Is this newly over?

        if (previouslyOver.indexOf(gameObject) === -1)
        {
            justOver.push(gameObject);
        }
    }

    //  By this point the arrays are filled, so now we can process what happened...

    //  Process the Just Out objects
    var total = justOut.length;

    if (total > 0)
    {
        this.sortGameObjects(justOut);

        this.events.dispatch(new InputEvent.POINTER_OUT(pointer, justOut));

        //  Call onOut for everything in the justOut array
        for (i = 0; i < total; i++)
        {
            gameObject = justOut[i];

            if (!gameObject.input)
            {
                continue;
            }

            this.events.dispatch(new InputEvent.GAME_OBJECT_OUT(pointer, gameObject));

            gameObject.input.onOut(gameObject, pointer);
        }
    }

    //  Process the Just Over objects
    total = justOver.length;

    if (total > 0)
    {
        this.sortGameObjects(justOver);

        this.events.dispatch(new InputEvent.POINTER_OVER(pointer, justOver));

        //  Call onOver for everything in the justOver array
        for (i = 0; i < total; i++)
        {
            gameObject = justOver[i];

            if (!gameObject.input)
            {
                continue;
            }

            this.events.dispatch(new InputEvent.GAME_OBJECT_OVER(pointer, gameObject));

            gameObject.input.onOver(gameObject, pointer, gameObject.input.localX, gameObject.input.localY);
        }
    }

    //  Add the contents of justOver to the previously over array
    previouslyOver = stillOver.concat(justOver);

    //  Then sort it into display list order
    this._over[pointer.id] = this.sortGameObjects(previouslyOver);
};

module.exports = ProcessOverOutEvents;
