<?php
$file = 'c:/laravel_projects/sys_rh/frontend/src/views/admin/EmployeeDetail.vue';
$content = file_get_contents($file);

// Remove the specific extra div blocks
$extra_divs = '                  </div>
                         </div>
                     </div>
                 </div>';

// This is tricky because the indentation might be mixed.
// I'll use a regex to match the extra divs precisely.

$regex = '/<\/div>\s+<\/div>\s+<\/div>\s+<\/div>\s+<\/div>\s+<\/Card>/s';
// Wait, looking at the view_file:
// 254:                       </div>
// 255:                   </div>
// 256:                          </div>
// 257:                      </div>
// 258:                  </div>
// 259:              </Card>
// That's 5 closing divs before Card.

$clean_replacement = '                      </div>
                  </div>
              </Card>';

$content = preg_replace($regex, $clean_replacement, $content);

file_put_contents($file, $content);
echo "Cleanup of extra divs attempted\n";
