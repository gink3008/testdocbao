def add_articles_from_newspaper(self, my_pid, webconfig, browser):
        '''
        function: crawl articles from a specific website
        input:
            - my_pid: pid of process that crawl this newspaper
            - webconfig: config of this newspaper
            - browser: browser that is used to crawl this newspaper
        '''
        #cdn_manager = CDNManager(self._config_manager)
        # get web config properites
        webname = webconfig.get_webname()
        weburl = webconfig.get_weburl()
        crawl_url = webconfig.get_crawl_url()
        web_language = webconfig.get_language()
        get_topic = webconfig.get_topic_from_link()
        topics_xpath = webconfig.get_topics_xpath()
        dates_xpath = webconfig.get_date_xpath()
        extract_xpath = webconfig.get_extract_xpath()
        sapos_xpath = webconfig.get_sapo_xpath()
        contents_xpath = webconfig.get_content_xpath()
        feature_images_xpath = webconfig.get_feature_image_xpath()
        id_type = webconfig.get_id_type()
        use_browser = webconfig.get_use_browser()
        maximum_url_to_visit = webconfig.get_maximum_url()
        get_detail_content = webconfig.get_detail_content()
        only_quality_post = webconfig.get_only_quality_post()
        tags = webconfig.get_tags()

        count_visit = 0 # to limit number of url to visit in each turn
        count_lay = 0
        full_url = ""
        blacklist =  []


        print()
        print("Crawler pid %s: Crawling newspaper: %s" % (my_pid,webname))


        a=True
        while a==True:
        #try:
            count_visit+=1
            html = read_url_source(crawl_url, webconfig, browser)

            if html is not None:
                print("Crawler pid %s: Getting data, please wait..." % my_pid)
                html_tree =  etree.HTML(html)

                for xpath_index in range(0, len(topics_xpath)):
                    print(topics_xpath[xpath_index])
                    topics_list = html_tree.xpath(topics_xpath[xpath_index])

                    for topic_index in range(0, len(topics_list)):
                        link = topics_list[topic_index]
                        # loc ket qua
                        if "href" in id_type:
                            fullurl = get_fullurl(weburl, str(link.get("href")))
                            print()
                            print("Crawler pid %s: Processing page: %s" % (my_pid, fullurl))

                        else:
                            fullurl = remove_html(get_tagstring_from_etree(link))
                            print()
                            print("Crawler pid %s: Processing topic" % my_pid)
                            print("Note: this website don't use href as id_type. Don't set date_place as detail_page")
                        #epdb.set_trace()
                        if not self.is_blacklisted(fullurl):
                            if not self.is_in_database(fullurl):
                                # check if fullurl satisfies url pattern
                                filter = re.compile(webconfig.get_url_pattern_re(), re.IGNORECASE)
                                if ('href' in id_type) and (filter.match(fullurl) is None):
                                    print("Crawler pid %s: Ignore. This url is from another site" % my_pid)
                                else:
                                    (result, has_visit_page) = self.investigate_if_link_is_valid_article(link, webconfig, html_tree, browser, xpath_index, topic_index)
                                    if has_visit_page:
                                        count_visit+=1

                                    print(count_visit)

                                    if result is not None: # no errors happend
                                        if result != False: # valid url
                                            (topic, publish_date, sapo, content, feature_image, avatar_url) = result
                                            if topic[-4:] == 'icon':
                                                topic = topic[:-4]
                                            if topic[-1:] == '.':
                                                topic = topic[:-1]
                                            topic = topic.strip()
                                            tpo_index = topic.find('TPO - ')
                                            if tpo_index != -1:
                                                topic = topic[:tpo_index]
                                            next_id = self.create_article_uuid()

                                            if 'href' not in id_type:
                                                href = webconfig.get_crawl_url()
                                            else:
                                                href = fullurl
                                            
                                            new_article = Article(article_id=next_id,
                                                                     topic=topic,
                                                                     date = publish_date,
                                                                     newspaper = webname,
                                                                     href=href,
                                                                     language=web_language,
                                                                     sapo=sapo,
                                                                     content=content,
                                                                     feature_image=feature_image,
                                                                     avatar = avatar_url,
                                                                     post_type = 0,
                                                                     author_id=webname,
                                                                     author_fullname=webname,
                                                                     tags = tags)
                                            if only_quality_post:
                                                if new_article.is_quality_content():
                                                    self.add_article(new_article)
                                                    # self.add_url_to_blacklist(fullurl)
                                                    count_lay +=1
                                                    print(f"{bcolors.OKGREEN} number artical: {count_lay} {bcolors.ENDC}")
                                                    print("Crawler pid %s: Crawled articles: %s" % (my_pid, str(count_lay)))
                                                else:
                                                    print(f"{bcolors.FAIL}Ignore. Not a quality post {bcolors.ENDC}")
                                            else:
                                                self.add_article(new_article)
                                                # self.add_url_to_blacklist(fullurl)
                                                count_lay +=1
                                                print("Crawler pid %s: Crawled articles: %s" % (my_pid, str(count_lay)))

                                            if has_visit_page:
                                                # wait for n second before continue crawl
                                                waiting_time = self._config_manager.get_waiting_time_between_each_crawl()
                                                print("Crawler pid %s: Waiting %s seconds before continue crawling" % (my_pid, str(waiting_time)))
                                                time.sleep(waiting_time + random.random()*3)

                                        else: #not valid link
                                            #self.add_url_to_blacklist(fullurl)
                                            blacklist.append(fullurl) # add invalid link to blacklist later to allow all link refer to the same fullurl will be checked
                                            print("Crawler pid %s: Wait finish crawling to add to blacklist" % my_pid)
                                    else: #timeout or smt else happended
                                        print(f"{bcolors.FAIL}Some errors happen. Check this link later{bcolors.ENDC}")

                                    if count_visit >= maximum_url_to_visit:  # Stop crawling to not get caught by server
                                        print(f"{bcolors.OKGREEN}if count_visit >= maximum_url_to_visit then stop : {bcolors.ENDC}")
                                        print("Crawler pid %s: Stop crawling %s to avoid being caught by server" % (my_pid, webname))
                                        for item in blacklist:
                                           self.add_url_to_blacklist(item)
                                        return None
                            else:
                                print("Crawler pid %s: This article has been in database" % my_pid)
                        else:
                            print(f"{bcolors.WARNING}Crawler pid {my_pid}: This link is in blacklist database {bcolors.ENDC}")
                            self.refresh_url_in_blacklist(fullurl)
            else:
                print(f"{bcolors.WARNING}Crawler pid %s: Can't open: %s {bcolors.ENDC}" % (my_pid, webname))
            a=False

            for item in blacklist:
                print(f"{bcolors.WARNING} source code add blacklist {bcolors.ENDC}")
                self.add_url_to_blacklist(item)