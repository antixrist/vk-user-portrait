var useScroll = false;
var useScrollAnimate = false;
var deltaMin = 100;
var deltaMax = 300;

(typeof window.Waiter == 'undefined') && (function () {
  /**
   * Waiter.js
   * https://github.com/antixrist/waiter.js
   */
  var WaiterContext = this;
  /**
   *
   * @param {Number} timeout Max time in milliseconds
   * @param {Number} interval Interval in milliseconds
   * @param {Function} condition Return your condition's result or run callback with this result as first argument (if your handling is async). Not both together! If you return array then its will be passed to callback at the end of the list of arguments
   * @param {Function} callback Callback function
   * @returns {Waiter}
   * @constructor
   */
  function Waiter (timeout, interval, condition, callback) {
    var options,
        args = Waiter.toArray(arguments),
        isCleanedArgs = args[4] || false;
  
    if (!isCleanedArgs) {
      options = Waiter._parseArgs(args);
      timeout = options.timeout;
      interval = options.interval;
      condition = options.condition;
      callback = options.callback;
    }
  
    // singleton
    if (!(this instanceof Waiter)) {
      isCleanedArgs = true;
      return new Waiter(timeout, interval, condition, callback, isCleanedArgs);
    }
  
    this.timeout = timeout;
    this.interval = interval;
    this.condition = condition;
    this.callback = callback;
  
    /**
     * @type {boolean}
     */
    this.done = false;
    /**
     * @type {number}
     */
    this.elapsedTime = 0;
    /**
     * @type {number}
     */
    this.iteration = 0;
    /**
     * @type {Number}
     */
    this.tstart = Waiter.getTimeInMs();
  
    this.check();
  }
  
  /**
   * @param {[]} args
   * @returns {{}}
   * @private
   */
  Waiter._parseArgs = function (args) {
    var options = {};
  
    if (args.length == 1) {
      options = args[0];
    } else {
      options.timeout = args[0] || false;
      options.interval = args[1] || false;
      options.condition = args[2] || false;
      options.callback = args[3] || false;
    }
  
    var result = {};
    result.timeout = parseInt(options.timeout || 1, 10) || 1;
    result.interval = parseInt(options.interval || 1, 10) || 1;
    result.condition = (typeof options.condition == 'function') ? options.condition : Waiter.noopPositive;
    result.callback = (typeof options.callback == 'function') ? options.callback : Waiter.noop;
  
    return result;
  };
  
  /**
   * @type {{constructor: Function, check: Function, afterCheck: Function, runCallback: Function}}
   */
  Waiter.prototype = {
    constructor: Waiter,
  
    check: function () {
      var self = this;
      var conditionResult, cbArgs;
      self.iteration = self.iteration + 1;
      self.elapsedTime = Waiter.getTimeInMs() - self.tstart;
      if (!self.done) {
        if (self.elapsedTime <= self.timeout) {
          conditionResult = self.condition(self.elapsedTime, self.iteration, self.afterCheck.bind(this));
          self.afterCheck(conditionResult);
        } else {
          // timeout
          cbArgs = [new Error(Waiter.errText), self.elapsedTime, self.iteration];
          self.runCallback.apply(self, cbArgs);
        }
      }
    },
    afterCheck: function (conditionResult) {
      var self = this;
      var cbArgs;
      if (typeof conditionResult != 'undefined') {
        if (!!conditionResult) {
          self.done = true;
          cbArgs = [null, self.elapsedTime, self.iteration];
          if (Waiter.isArray(conditionResult)) {
            cbArgs = cbArgs.concat(conditionResult);
          }
          self.runCallback.apply(self, cbArgs);
        } else {
          setTimeout(function () {
            self.check();
          }, self.interval);
        }
      }
    },
    runCallback: function (args) {
      if (typeof args == 'undefined' || !Waiter.isArray(args)) {
        args = Waiter.toArray(arguments);
      }
  
      this.callback.apply(WaiterContext, args);
  
      // self destruction
      // delete(this);
    }
  };
  
  /**
   * Error message if time elapsed with false condition
   * @type {string}
   */
  Waiter.errText = '[waiter.js] Timeout with false condition';
  
  /**
   * Plug function
   */
  Waiter.noop = function () {};
  
  /**
   * Positive plug function
   * @returns {boolean}
   */
  Waiter.noopPositive = function () { return true; };
  
  /**
   * Return current timestamp in milliseconds
   * @returns {Number}
   */
  Waiter.getTimeInMs = function () {
    if (!Date.now) {
      Date.now = function now() {
        return new Date().getTime();
      };
    }
    return Date.now();
  };
  
  /**
   * @param raw
   * @returns {Array}
   */
  Waiter.toArray = function (raw) {
    return Array.prototype.slice.call(raw, 0);
  };
  /**
   * @param arg
   * @returns {boolean}
   */
  Waiter.isArray = function (arg) {
    if (!Array.isArray) {
      Array.isArray = function(arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
      };
    }
  
    return Array.isArray(arg);
  };
  
  waiter = Waiter;
  if (typeof module != 'undefined' && typeof module.exports != 'undefined') {
    module.exports = waiter;
  }
  // /Waiter.js
})();

(typeof window.vk_portrait == 'undefined' || !window.vk_portrait) && (function () {
  
  var isNumeric = function (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  };

  var log = function () {
    var $ = window.jQuery;

    var args = Array.prototype.slice.call(arguments, 0);
    var text = args[0] || '', isError = false, needAlert = false, data = false;
    var prefix = '[vk_portrait] ';
    var suffix = '';

    if (!text) { return; }

    if (typeof args[1] == 'boolean' || isNumeric(args[1])) {
      isError = !!args[1];

      if (typeof args[2] == 'boolean' || isNumeric(args[2])) {
        needAlert = !!args[2];
        data = args[3];
      } else {
        data = args[2];
      }
    } else {
      data = args[1];
    }

    if (data) {
      if ($.isPlainObject(data)) {
        suffix = '\n'+ JSON.stringify(data);
      } else if ($.isArray(data)) {
        suffix = '\n'+ data.join('\n');
      }
    }

    // var method = (isError) ? 'error' : 'info';
    var method = 'info';
    if (isError) {
      prefix = prefix + '[error] ';
    }

    console[method](prefix + text + suffix);
    data && console.log(data);
    needAlert && alert(prefix + text + suffix);
  };

  var random = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };


  (typeof window.jQuery == 'undefined') && (function () {
    window.setTimeout(function () {
      var d = document;
      var f = d.getElementsByTagName('script')[0];
      var s = d.createElement('script');
      s.type = 'text/javascript';
      s.async = true;
      s.src = '//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js?'+ (new Date()).getTime();
      f.parentNode.insertBefore(s, f);
    }, 1);
  })();

  var runCondition = function () {
    return typeof window.jQuery != 'undefined';
  };

  log('Waiting jQuery...');
  waiter(5000, 100, function (timeElapsed, iteration, cb) {
    var condition = runCondition();
    // console.log('check! elapsed time:', timeElapsed +'ms', '; iteration:', iteration, '; result:', condition);
    return condition;
  }, function (err, timeElapsed, iteration) {
    if (err) {
      log('jQuery load failed', true, true);
      return;
    }
    window.vk_portrait = true;

    var $ = window.jQuery;
    // console.log('run!', timeElapsed +'ms', 'and', iteration, 'iteration', '; window.jQuery:', window.jQuery, '$', $);
    log('jQuery loaded!');

    var getScreenName = function (str) {
      var screenName =  (str || '').match(/(https?:\/\/)?(vk.com)?\/?([^\?]+)/)[3] || '';
      screenName = (parseInt(screenName, 10) == screenName) ? 'id'+ screenName : screenName;

      return screenName;
    };

    var myScreenName = false;
    var getMyScreenName = function () {
      if (!myScreenName) {
        myScreenName = $('#myprofile').attr('href').match(/\/(.+?)/)[1];
      }
      return myScreenName;
    };

    var removeAllPostsFromDom = function () {
      $('.feed_row').remove();
    };

    var loadNewPosts = function (cb) {
      removeAllPostsFromDom();
      
      feed.showMore();

      waiter(30000, 200, function () {
        return $('.post').length;
      }, function (err) {
        if (err) {
          log('No finded posts!', true, true);
          window.vk_portrait = false;
        }
        $.isFunction(cb) && cb();
      });
    }

    var getPostsSelector = function (posts, prefix) {
      if (!$.isArray(posts)) { return ''; }

      return '#'+ (prefix || '') + posts.join(', #'+ (prefix || ''));
    };

    var getPostsIds = function () {
      var $posts = $('.post');
      var posts = [];
      $posts.each(function (i, post) {
        var $post = $(post);
        var id = post.id;
        
        var tmp = id.match(/post(.+)/)[1];
        
        posts.push(tmp);
      });

      return posts;
    };

    var scrollToPost = function (post, cb) {
      $node = $('#post'+ post);

      window.setTimeout((function (post, cb) {
        return function () {
          if (useScroll) {

            if (useScrollAnimate) {

              $('html,body').animate({
                scrollTop: $node.offset().top
              }, random(deltaMin, deltaMax), function () {
                $.isFunction(cb) && cb(post);
              });

            } else {

              $('html,body').scrollTop($node.offset().top);
              $.isFunction(cb) && cb(post);

            }
          } else {

            $.isFunction(cb) && cb(post);

          }
        };
      })(post, cb), random(deltaMin, deltaMax));
    };

    var formatResult = function (data) {
      if (!$.isArray(data)) { return data; }

      return data.map(function (item, index) {
        return 'https://vk.com/wall'+ item;
      });
    };


    var getsPostsTopLikes = function (posts, cb) {
      if (!$.isArray(posts)) { return []; }

      var result = [];

      var counter = 0;
      posts.forEach(function (post, index) {
        if (post.split('_').length != 2) {
          counter++;
          return;
        }
        scrollToPost(post, function (post) {
          $.post('https://vk.com/like.php', {
            act: 'a_get_stats',
            al: 1,
            has_share: 1,
            object: 'wall'+ post
          }, (function (post) {
            return function (data) {
              counter++;
              if (!data) { return; }

              var matches = data.match(/href[\s]?=[\s]?['"][\s]?\/(.+?)[\s]?['"]/gm);
              matches.forEach(function (match, index) {
                var screen_name = match.match(/href[\s]?=[\s]?['"][\s]?\/(.+?)[\s]?['"]/)[1];
                if (screen_name == searchScreenName) {
                  result.push(post);
                }
              });

              if ($.isFunction(cb) && counter == posts.length) {
                result = (result.length) ? $.unique(result) : result;
                cb(result);
              }
            };
          })(post));
        });
      });
    };


    var result = [];
    var start = function () {
      window.ajaxCache = {};
      var posts = getPostsIds();
      if (posts.length) {
        getsPostsTopLikes(posts, function (finded) {
          if (finded.length) {
            finded = formatResult(finded);
            log('finded:', finded, false, false);
            result = result.concat(finded);
          }
          if (window.vk_portrait) {
            window.setTimeout(function () {
              loadNewPosts(function () {
                start();
              });
            }, random(deltaMin, deltaMax));
          } else {
            log('Stopped!', result, false, true);
          }
        });
      } else {
        log('Done!', result, false, true);
      }
    };

    window.vkPortraitResolverCallback = function (data) {
      var script = document.getElementById('vkPortraitResolver');
      !!script && script.remove();
      if (data && data.response && data.response.type == 'user' && data.response.object_id) {
        log('Resolved user\'s id: '+ data.response.object_id);
        var feedUrl = 'https://vk.com/feed?section=source&source='+ data.response.object_id;
        
        if (data.response.object_id) {
          log('Try to loading user\'s feed page...');
          nav.go(feedUrl, null, {noback: true});

          waiter(5000, 100, function () {
            return document.location.href == feedUrl && $('.post').length;
          }, function (err) {
            if (err) {
              log('Fail loading feed page!', true, true);
              return;
            }

            log('Feed loaded! Seaching...');
            start();
          });

        } else {
          log('Resolve user\'s fail!', true, true);
        }
      }
    }
    
    var searchScreenName = prompt('Enter link', '');
    if (!searchScreenName) {
      log('Link required', 1, 1);
      return;
    }
    searchScreenName = getScreenName(searchScreenName);
    log('User\'s screen name: "'+ searchScreenName +'"');

    var script = document.createElement('script');
    script.id = 'vkPortraitResolver';
    script.src = 'https://api.vk.com/method/utils.resolveScreenName?screen_name='+ searchScreenName +'&v=5.35&callback=vkPortraitResolverCallback';
    script.onerror = function () {
      log('Resolve user\'s fail!', true, true);
    };
    log('Try to resolve user\'s id...');
    document.getElementsByTagName("head")[0].appendChild(script); 
  });
})();

