import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSettings, getPayPeriodRange, type PayPeriodType, DAY_NAMES } from '@/context/SettingsContext'

export default function SettingsPage() {
  const { settings, setSettings } = useSettings()
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const { company, pricing, payPeriod } = settings

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-white">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-stone-400 text-sm mt-1">Manage your company info and default pricing.</p>
      </div>

      <Tabs defaultValue="company">
        <TabsList className="bg-stone-800 border border-stone-700">
          <TabsTrigger value="company" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-stone-400">Company</TabsTrigger>
          <TabsTrigger value="pricing" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-stone-400">Pricing Defaults</TabsTrigger>
          <TabsTrigger value="payperiod" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-stone-400">Pay Period</TabsTrigger>
          <TabsTrigger value="subscription" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-stone-400">Subscription</TabsTrigger>
        </TabsList>

        {/* Company Info */}
        <TabsContent value="company">
          <Card className="bg-stone-900 border-stone-800 text-white">
            <CardHeader>
              <CardTitle className="text-white">Company Information</CardTitle>
              <CardDescription className="text-stone-400">This info will appear on estimates and documents.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-stone-300">Company Name</Label>
                  <Input value={company.name} onChange={e => setSettings(s => ({ ...s, company: { ...s.company, name: e.target.value } }))}
                    placeholder="Acme Roofing" className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500" />
                </div>
                <div className="space-y-2">
                  <Label className="text-stone-300">Phone</Label>
                  <Input value={company.phone} onChange={e => setSettings(s => ({ ...s, company: { ...s.company, phone: e.target.value } }))}
                    placeholder="(555) 000-0000" className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500" />
                </div>
                <div className="space-y-2">
                  <Label className="text-stone-300">Email</Label>
                  <Input value={company.email} onChange={e => setSettings(s => ({ ...s, company: { ...s.company, email: e.target.value } }))}
                    placeholder="info@company.com" className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500" />
                </div>
                <div className="space-y-2">
                  <Label className="text-stone-300">License #</Label>
                  <Input value={company.license} onChange={e => setSettings(s => ({ ...s, company: { ...s.company, license: e.target.value } }))}
                    placeholder="CA C-39 #000000" className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-stone-300">Address</Label>
                  <Input value={company.address} onChange={e => setSettings(s => ({ ...s, company: { ...s.company, address: e.target.value } }))}
                    placeholder="123 Main St, City, CA 00000" className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-stone-300">Website</Label>
                  <Input value={company.website} onChange={e => setSettings(s => ({ ...s, company: { ...s.company, website: e.target.value } }))}
                    placeholder="https://yourcompany.com" className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500" />
                </div>
              </div>
              <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                {saved ? 'Saved!' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Defaults */}
        <TabsContent value="pricing">
          <Card className="bg-stone-900 border-stone-800 text-white">
            <CardHeader>
              <CardTitle className="text-white">Pricing Defaults</CardTitle>
              <CardDescription className="text-stone-400">Default values used when creating new estimates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-stone-300">Waste %</Label>
                  <Input type="number" value={pricing.wastePct} onChange={e => setSettings(s => ({ ...s, pricing: { ...s.pricing, wastePct: e.target.value } }))}
                    className="bg-stone-800 border-stone-700 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-stone-300">Markup %</Label>
                  <Input type="number" value={pricing.markupPct} onChange={e => setSettings(s => ({ ...s, pricing: { ...s.pricing, markupPct: e.target.value } }))}
                    className="bg-stone-800 border-stone-700 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-stone-300">Labor per Square ($)</Label>
                  <Input type="number" value={pricing.laborPerSq} onChange={e => setSettings(s => ({ ...s, pricing: { ...s.pricing, laborPerSq: e.target.value } }))}
                    className="bg-stone-800 border-stone-700 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-stone-300">Tear-off Rate per Square ($)</Label>
                  <Input type="number" value={pricing.tearoffRate} onChange={e => setSettings(s => ({ ...s, pricing: { ...s.pricing, tearoffRate: e.target.value } }))}
                    className="bg-stone-800 border-stone-700 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-stone-300">Hourly Rate ($)</Label>
                  <Input type="number" value={pricing.hourlyRate} onChange={e => setSettings(s => ({ ...s, pricing: { ...s.pricing, hourlyRate: e.target.value } }))}
                    className="bg-stone-800 border-stone-700 text-white" />
                </div>
              </div>
              <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                {saved ? 'Saved!' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pay Period */}
        <TabsContent value="payperiod">
          <Card className="bg-stone-900 border-stone-800 text-white">
            <CardHeader>
              <CardTitle className="text-white">Pay Period</CardTitle>
              <CardDescription className="text-stone-400">Set how your employees are paid and when the period starts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-stone-300">Pay Period Type</Label>
                  <Select value={payPeriod.type} onValueChange={v => setSettings(s => ({ ...s, payPeriod: { ...s.payPeriod, type: v as PayPeriodType } }))}>
                    <SelectTrigger className="bg-stone-800 border-stone-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-stone-800 border-stone-700 text-white">
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Biweekly (every 2 weeks)</SelectItem>
                      <SelectItem value="semimonthly">Semimonthly (1st &amp; 15th)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {payPeriod.type === 'weekly' && (
                  <div className="space-y-2">
                    <Label className="text-stone-300">Week Starts On</Label>
                    <Select value={String(payPeriod.weeklyStartDay)} onValueChange={v => setSettings(s => ({ ...s, payPeriod: { ...s.payPeriod, weeklyStartDay: Number(v) } }))}>
                      <SelectTrigger className="bg-stone-800 border-stone-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-stone-800 border-stone-700 text-white">
                        {DAY_NAMES.map((day, i) => (
                          <SelectItem key={i} value={String(i)}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {payPeriod.type === 'biweekly' && (
                  <div className="space-y-2">
                    <Label className="text-stone-300">Reference Start Date</Label>
                    <Input type="date" value={payPeriod.biweeklyAnchor}
                      onChange={e => setSettings(s => ({ ...s, payPeriod: { ...s.payPeriod, biweeklyAnchor: e.target.value } }))}
                      className="bg-stone-800 border-stone-700 text-white" />
                    <p className="text-stone-500 text-xs">The app will auto-calculate every 2-week period from this date forward.</p>
                  </div>
                )}
              </div>

              {/* Preview current period */}
              <div className="bg-stone-800 rounded-lg p-3 text-sm">
                <p className="text-stone-400 text-xs mb-1">Current Pay Period</p>
                <p className="text-emerald-400 font-medium">
                  {getPayPeriodRange(settings).start} – {getPayPeriodRange(settings).end}
                </p>
                <p className="text-stone-500 text-xs mt-1">Updates automatically — no manual changes needed.</p>
              </div>
              <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                {saved ? 'Saved!' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription */}
        <TabsContent value="subscription">
          <Card className="bg-stone-900 border-stone-800 text-white">
            <CardHeader>
              <CardTitle className="text-white">Subscription</CardTitle>
              <CardDescription className="text-stone-400">Your current plan and billing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { name: 'Solo', price: '$29', period: '/mo', features: ['1 admin/sales user', 'Up to 10 active jobs', 'Estimates & calculator', 'Time clock'] },
                  { name: 'Crew', price: '$59', period: '/mo', features: ['Up to 5 admin/sales users', 'Unlimited jobs', 'Estimates & calculator', 'Time clock'], highlight: true },
                  { name: 'Company', price: '$99', period: '/mo', features: ['Unlimited admin/sales users', 'Unlimited jobs', 'Estimates & calculator', 'Time clock', 'White-label PDF'] },
                ].map(tier => (
                  <div key={tier.name} className={`border rounded-lg p-4 space-y-3 hover:border-emerald-600 transition-colors cursor-pointer ${tier.highlight ? 'border-emerald-600 bg-stone-800' : 'border-stone-700'}`}>
                    <p className="text-white font-semibold text-lg">{tier.name}</p>
                    <div className="flex items-end gap-1">
                      <span className="text-emerald-400 font-mono text-4xl font-bold tracking-tight">{tier.price}</span>
                      <span className="text-stone-400 text-sm mb-1">{tier.period}</span>
                    </div>
                    <ul className="space-y-1">
                      {tier.features.map(f => (
                        <li key={f} className="text-stone-400 text-sm flex items-center gap-2">
                          <span className="text-emerald-500">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <p className="text-stone-500 text-sm">Payment integration coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
