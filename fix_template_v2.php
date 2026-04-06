<?php
$file = 'c:/laravel_projects/sys_rh/frontend/src/views/admin/EmployeeDetail.vue';
$content = file_get_contents($file);

// Section 1: Payments - Using Regex for better matching
$payments_regex = '/<div v-if="loadingPayments".*?Nenhum pagamento registrado para este funcionário\..*?<\/div>.*?<div v-else>.*?<div class="space-y-3">.*?<\/div>.*?<\/div>/s';
$payments_new = '<div v-if="loadingPayments" class="text-center py-4">
                      <Loading message="Carregando pagamentos..." />
                  </div>
                  <div v-else-if="payments.length === 0" class="text-center py-4">
                      <p>Nenhum pagamento registrado para este funcionário.</p>
                  </div>
                  <div v-else>
                      <div class="table-container">
                          <table class="data-table">
                              <thead>
                                  <tr>
                                      <th>Data Pagamento</th>
                                      <th>Período</th>
                                      <th>Valor</th>
                                      <th>Status</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  <tr v-for="payment in payments" :key="payment.id">
                                      <td>{{ formatDate(payment.payment_date) }}</td>
                                      <td>
                                          <div class="text-xs text-gray-500">
                                              {{ formatDate(payment.period_start) }} - {{ formatDate(payment.period_end) }}
                                          </div>
                                      </td>
                                      <td class="font-semibold">{{ formatCurrency(payment.amount) }}</td>
                                      <td>
                                          <span :class="[\'status-badge\', `status-${payment.status?.toLowerCase()}`]">
                                              {{ getPayrollStatusLabel(payment.status) }}
                                          </span>
                                      </td>
                                  </tr>
                              </tbody>
                          </table>
                      </div>
                  </div>';

$content = preg_replace($payments_regex, $payments_new, $content);

file_put_contents($file, $content);
echo "Payments Template Replacement Attempted via Regex\n";
