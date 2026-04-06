<?php
$file = 'c:/laravel_projects/sys_rh/frontend/src/views/admin/EmployeeDetail.vue';
$content = file_get_contents($file);

// Section 1: Payments
$payments_old = '                  <div v-else>
                      <div class="space-y-3">
                          <div v-for="payment in payments" :key="payment.id" class="border rounded-lg p-3">
                              <div class="flex justify-between items-start mb-2">
                                  <span class="font-medium">{{ formatDate(payment.payment_date) }}</span>
                                  <span class="font-semibold text-green-600">{{ formatCurrency(payment.amount) }}</span>
                              </div>
                              <div class="text-sm text-gray-600">
                                  <p><strong>Período:</strong> {{ formatDate(payment.period_start) }} a {{ formatDate(payment.period_end) }}</p>
                                  <p v-if="payment.description" class="mt-1"><strong>Descrição:</strong> {{ payment.description }}</p>
                                  <p v-if="payment.status" class="mt-1">
                                      <span :class="`status-badge status-${payment.status.toLowerCase()}`">
                                          {{ payment.status }}
                                      </span>
                                  </p>
                              </div>
                          </div>
                      </div>
                  </div>';

$payments_new = '                  <div v-else>
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

// Section 2: Absences (using a more flexible match for the "Observação" part which had encoding issues)
$absences_regex = '/<div v-else-if="absences\.length === 0".*?Nenhum registro de pontuação encontrado para este funcionário\..*?<\/div>.*?<div v-else>.*?<div class="space-y-3">.*?<\/div>.*?<\/div>/s';
$absences_new = '<div v-else-if="absences.length === 0" class="text-center py-4">
                      <p>Nenhum registro de pontuação encontrado para este funcionário.</p>
                  </div>
                  <div v-else>
                      <div class="table-container">
                          <table class="data-table">
                              <thead>
                                  <tr>
                                      <th>Data</th>
                                      <th>Tipo/Status</th>
                                      <th>Duração</th>
                                      <th>Observação</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  <tr v-for="absence in absences" :key="absence.id">
                                      <td>{{ formatDate(absence.date) }}</td>
                                      <td>
                                          <span :class="[\'status-badge\', `status-${absence.status?.toLowerCase()}`]">
                                              {{ getAttendanceStatusLabel(absence.status) }}
                                          </span>
                                      </td>
                                      <td>{{ absence.duration }} dia(s)</td>
                                      <td class="text-xs text-gray-500">{{ absence.notes || \'-\' }}</td>
                                  </tr>
                              </tbody>
                          </table>
                      </div>
                  </div>';

// Try simple string replace for payments
$content = str_replace($payments_old, $payments_new, $content);

// Try regex for absences to bypass encoding issues in "Observação"
$content = preg_replace($absences_regex, $absences_new, $content);

file_put_contents($file, $content);
echo "Template Replacement Attempted\n";
