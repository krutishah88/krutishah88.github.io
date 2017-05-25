function blog () {

    var xhr;
    var allBlogObjects;
    var isEditView = false;

   this.initialize = function() {
        makeXHRRequest();
        createNewPost();
    }

    function createNewPost() {
        document.querySelector('.create-post').addEventListener('click', function (e) {
           renderNewPostView();
        })
        document.querySelector('.save-new-post').addEventListener('click', function(e){
            var title = document.querySelector('.create-new-title input').value;
            var text = document.querySelector('.create-new-text textarea').value;
            if (isEditView) {
                saveNewPost(text,title,isEditView);
            } else {
                saveNewPost(text,title);
            }

        })
    }

    function closeNewPostView() {
        document.querySelector('.create-view').classList.add('hide');
        document.querySelector('.create-new-title input').value = '';
        document.querySelector('.create-new-text textarea').value = '';
        document.querySelector('.overlay').classList.add('hide');
    }

    function renderNewPostView() {
        document.querySelector('.create-view').classList.remove('hide');
        document.querySelector('.overlay').classList.remove('hide');
    }

    function renderEditPostView(id,text,title) {
        document.querySelector('.create-view').classList.remove('hide');
        document.querySelector('.overlay').classList.remove('hide');
        document.querySelector('.create-new-title input').value = title;
        document.querySelector('.create-new-text textarea').value = text;
        isEditView = id;

    }

    function saveNewPost(text,title, id) {
        // Create the xhr request to get the photos
        if(window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        }
        else if(window.ActiveXObject) {
            xhr = new ActiveXObject('Microsoft.XMLHTTP');
        }

        if (id) {
            xhr.open('POST', 'https://restedblog.herokuapp.com/kruti/api/' + id);
        } else {
            xhr.open('POST', 'https://restedblog.herokuapp.com/kruti/api/ ');
        }

        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        xhr.onload = function() {
            if (xhr.status === 200) {
                var responseData = JSON.parse(xhr.responseText);
                closeNewPostView();
                if(isEditView) {
                    for(var i=0; i<allBlogObjects.length;i++) {
                        if(allBlogObjects[i].id === isEditView) {
                            var elem = document.getElementById(allBlogObjects[i].id);
                            elem.querySelector('.blog-title-text').innerHTML = responseData.title;
                            elem.querySelector('.blog-text').innerHTML = responseData.text;
                            allBlogObjects[i].title = responseData.title;
                            allBlogObjects[i].text = responseData.text;
                        }
                    }
                    isEditView = false;
                } else {
                    allBlogObjects.push(generateAllPostsHTML([responseData], true));
                    document.querySelector('.actions-view').addEventListener('click', function(e){
                        var cardNode = e.currentTarget.parentNode;
                        var index = getTheBlogActedOn(cardNode);
                        var id = allBlogObjects[index].id;
                        var text = allBlogObjects[index].text;
                        var title = allBlogObjects[index].title;
                        if(e.target.classList.value.indexOf('delete-post') > -1) {
                            deletePost(id);
                        } else if (e.target.classList.value.indexOf('edit-post') > -1) {
                            renderEditPostView(id,text,title)
                        }
                    })
                }

            }
            else {
                console.log('Request failed.  Returned status of ' + xhr.status);
            }
        };
        var params = 'text=' + text + '&title='+title;
        xhr.send(params);
    }


    function makeXHRRequest() {
        // Create the xhr request to get the photos
        if(window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        }
        else if(window.ActiveXObject) {
            xhr = new ActiveXObject('Microsoft.XMLHTTP');
        }

        xhr.open('GET', 'https://restedblog.herokuapp.com/kruti/api/ ');
        xhr.onload = function() {
            if (xhr.status === 200) {
                var responseData = JSON.parse(xhr.responseText);
                var temp = responseData
                allBlogObjects = generateAllPostsHTML(temp);
                addDeleteAndEditActions();
            }
            else {
                console.log('Request failed.  Returned status of ' + xhr.status);
            }
        };
        xhr.send();
    }

    function addDeleteAndEditActions() {
        var elems = document.querySelectorAll('.actions-view');
       for(var i=0; i<elems.length; i++) {
           elems[i].addEventListener('click', function(e){
               var cardNode = e.currentTarget.parentNode;
               var index = getTheBlogActedOn(cardNode);
               var id = allBlogObjects[index].id;
               var text = allBlogObjects[index].text;
               var title = allBlogObjects[index].title;
               if(e.target.classList.value.indexOf('delete-post') > -1) {
                   deletePost(id);
               } else if (e.target.classList.value.indexOf('edit-post') > -1) {
                   renderEditPostView(id,text,title)
               }
           })
       }

    }

    function deletePost(id) {
        if(window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        }
        else if(window.ActiveXObject) {
            xhr = new ActiveXObject('Microsoft.XMLHTTP');
        }
        var url = 'https://restedblog.herokuapp.com/kruti/api/' + id;

        xhr.open('DELETE', url);
        xhr.onload = function() {
            if (xhr.status === 200) {
               deleteBlogFromView(id);
               addDeleteAndEditActions();
            }
            else {
                console.log('Request failed.  Returned status of ' + xhr.status);
            }
        };
        xhr.send();
    }

    function deleteBlogFromView(id) {
       for (var i=0; i<allBlogObjects.length; i++) {
           if(allBlogObjects[i].id === id) {
               allBlogObjects.splice(i,1);
               break;
           }
       }
       generateAllPostsHTML(allBlogObjects, false, deletePost);

    }

    function getTheBlogActedOn(cardNode) {
       for (var i=0; i<allBlogObjects.length; i++) {
           if(cardNode === allBlogObjects[i].htmlElem) {
               return i;
           }
       }

       return false;
    }


    function generateAllPostsHTML(data, newPost, deletePost){
        var holderDiv = document.querySelector('.view-all-section');
        if (deletePost) {
            holderDiv.innerHTML = '';
        }
        var fragment = document.createDocumentFragment();

        for ( var i=0; i<data.length; i++) {
            var blogMsgCard = document.createElement("div");
            var titleDiv = document.createElement("div");
            var titleContentDiv = document.createElement("div");
            var timeSpan = document.createElement("span");
            var contentDiv = document.createElement("div");
            var actionsDiv = document.createElement("div");
            var deleteAction = document.createElement("div");
            var editAction = document.createElement("div");

            contentDiv.innerHTML = data[i].text;
            contentDiv.classList.add('blog-text');
            timeSpan.innerHTML = data[i].timestamp;
            timeSpan.classList.add('timestamp');
            titleContentDiv.innerHTML = data[i].title;
            titleContentDiv.classList.add('blog-title-text');
            titleDiv.classList.add('title-holder');
            blogMsgCard.classList.add('card-view');
            blogMsgCard.setAttribute('id', data[i].id)

            titleDiv.appendChild(titleContentDiv);
            titleDiv.appendChild(timeSpan);

            // TODO: remove
            editAction.innerHTML = 'Edit';
            deleteAction.innerHTML = 'Delete';

            editAction.classList.add('edit-post');
            deleteAction.classList.add('delete-post');
            actionsDiv.classList.add('actions-view');

            actionsDiv.appendChild(deleteAction);
            actionsDiv.appendChild(editAction)
            blogMsgCard.appendChild(titleDiv);
            blogMsgCard.appendChild(contentDiv);
            blogMsgCard.appendChild(actionsDiv)

            fragment.appendChild(blogMsgCard);
            data[i].htmlElem = blogMsgCard;

        }
        if (newPost) {
            holderDiv.prepend(fragment);
            return data[0];
        }else{
            holderDiv.appendChild(fragment);

        }


        return data;
    }


};

var blogInstance = new blog();
blogInstance.initialize();
